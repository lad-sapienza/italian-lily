import React, { useState } from "react"
import PropTypes from "prop-types"
import { Button } from "react-bootstrap"
import { Filter, Funnel } from "react-bootstrap-icons"
import SearchUiAdv from "./searchUiAdv"
import SearchUiSimple from "./searchUiSimple"
import { defaultOperatorsProptypes } from "./defaultOperators"

const SearchUI = ({ fieldList, processData, operators, connectors }) => {
  const [isSimple, setIsSimple] = useState(true)

  const onClickSimple = () => setIsSimple(!isSimple)

  if (!fieldList) {
    return (
      <div className="text-danger">
        Parameter <code>fieldList</code> missing! Component{" "}
        <code>SearchUI</code> cannot be initialised
      </div>
    )
  }

  return (
    <React.Fragment>
      <div className="text-end">
        <Button onClick={onClickSimple} variant="warning">
          {isSimple && <Filter />}
          {!isSimple && <Funnel />}
        </Button>
      </div>
      {isSimple && (
        <SearchUiSimple fieldList={fieldList} processData={processData} />
      )}
      {!isSimple && (
        <SearchUiAdv
          fieldList={fieldList}
          operators={operators}
          connectors={connectors}
          processData={processData}
        />
      )}
    </React.Fragment>
  )
}

SearchUI.propTypes = {
  /**
   * Object with list of fields (field_name: field Label) to use for searching
   * Required.
   * Example: {
   *  "field_1_name": "First field label",
   *  "field_2_name": "Second field label",
   * }
   */
  fieldList: PropTypes.object.isRequired,
  /**
   * Callback function to run on data.
   * Accepts a connector as the first parameter (_and or _or) 
   * and an array of input data as a secon parameter. Each input is an object
   * implementing providing: field, operator, and value
    },
   */
  processData: PropTypes.func,

  /**
   * Object with operators to implement UI in other languages
   */
  operators: defaultOperatorsProptypes,

  /**
   * Object with connectors to implement UI other languages
   * Must implement {
   * "_and": "some Label"
   * "_or": "Some Label"
   * }
   */
  connectors: PropTypes.shape({
    /**
     * Label for _and connector
     */
    _and: PropTypes.string,
    /**
     * Label for _or connector
     */
    _or: PropTypes.string,
  }),
}

export default SearchUI
