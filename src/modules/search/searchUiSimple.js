import React, { useState } from "react"
import { Button, Col, Form, Row } from "react-bootstrap"
import { Search } from "react-bootstrap-icons"

const SearchUiSimple = ({ fieldList, processData }) => {
  const [searchText, setSearchText] = useState()
  const handleChange = event => {
    let { value } = event.target
    setSearchText(value)
  }

  const preProcessData = searchText => {
    const filters = []
    Object.entries(fieldList).forEach(([k, v]) => {
      filters.push({
        field: k,
        operator: "_icontains",
        value: searchText,
      })
    })
    processData("_or", filters)
  }

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form.Control type="search" onChange={e => handleChange(e)} />
        </Col>
        <Col>
          <Button
            variant="success"
            onClick={e => {
              preProcessData(searchText)
            }}
          >
            <Search />
          </Button>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default SearchUiSimple
