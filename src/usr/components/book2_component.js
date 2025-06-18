import React, { useState, useEffect } from "react"
import { Record, RecordContext } from "../../modules/record/record"
import { Accordion, Row, Col, Stack, Button } from "react-bootstrap"
import { SwitchLayoutButton } from "../components/switcher"

export const MDXLayout = () => {
  const [searchParams, setSearchParams] = useState(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      setSearchParams({
        tb: "libro",
        id: params.get("id")
      })
    }
  }, [])

  if (!searchParams) {
    return <div>Loading...</div>
  }

  return (
    <Record search={searchParams}>
      <RecordContext.Consumer>
        {recordData => {
          // ... tutto il tuo codice JSX di prima, identico ...
        }}
      </RecordContext.Consumer>
    </Record>
  )
}
