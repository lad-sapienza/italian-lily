/**
 * Search Component
 *
 * A React component that provides a search interface for querying data from a specified source.
 * It allows users to input search criteria and displays the results based on the provided template.
 *
 */

import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"

import SearchUI from "./searchUI"
import plain2directus from "../../services/transformers/plain2directus"
import getDataFromSource from "../../services/getDataFromSource"
import sourcePropTypes from "../../services/sourcePropTypes"
import { defaultOperatorsProptypes } from "./defaultOperators"
import fieldsPropTypes from "../../services/fieldsPropTypes"

const Search = ({
  source,
  resultItemTemplate,
  resultsHeaderTemplate = tot => (
    <>
      <h1 className="mt-5">Results</h1>
      <p className="text-secondary">— {tot} records found</p>
    </>
  ),
  fieldList,
  operators,
  connector,
}) => {
  const [searchResults, setSearchResults] = useState([])
  const [error, setError] = useState(null)
  const [queryRun, setQueryRun] = useState(false)

  useEffect(() => {
    if (!fieldList) {
      setError("fieldList parameter is missing")
    }
  }, [fieldList])

  const processData = async (conn, inputs) => {
    try {
      const filter = JSON.stringify(plain2directus(conn, inputs))

      const newSource = createNewSource(source, filter)

      const data = await getDataFromSource(newSource)
      setQueryRun(true)

      if (data.errors) {
        throw new Error("Error in querying remote data")
      }

      setSearchResults(data)
      setError(null)
    } catch (err) {
      console.error(err)
      setError("Error in querying remote data")
    }
  }
  const createNewSource = (source, filter) => {
    const newSource = structuredClone(source)
    newSource.transType = "json"
    newSource.dQueryString = `${source.dQueryString ? `${newSource.dQueryString}&` : ""}filter=${filter}`
    return newSource
  }

  return (
    <>
      <SearchUI
        fieldList={fieldList}
        operators={operators}
        connector={connector}
        processData={processData}
      />

      {error && <div className="text-danger">{error}</div>}

      {queryRun && searchResults.length === 0 && !error && (
        <div className="text-warning">No results found</div>
      )}

      {searchResults.length > 0 && !error && (
        <>
          {resultsHeaderTemplate(searchResults.length)}
          <div className="resultsContainer">
            {searchResults.map(item => resultItemTemplate(item))}
          </div>
        </>
      )}
    </>
  )
}

Search.propTypes = {
  /**
   * Object with information to source data.
   * This should include the necessary properties for querying the data source.
   */
  source: sourcePropTypes.isRequired,

  /**
   * Template function to render each result item.
   * This function receives an item from the search results and should return a React element.
   */
  resultItemTemplate: PropTypes.func.isRequired,
  /**
   * Template function to render the header of the results.
   * Default is a simple header in English with the number of results.
   */
  resultsHeaderTemplate: PropTypes.func,
  /**
   * List of fields to be used in the search.
   * This should be an object defining the fields available for querying.
   */
  fieldList: fieldsPropTypes,

  /**
   * Object containing the identifiers of the operators (keys) and the labels to use for the UI.
   * This can be used to overwrite default options, for example, to have the UI translated in a language different from English.
   * Its presence does not impact functionality.
   */
  operators: defaultOperatorsProptypes,

  /**
   * Object containing the logical connectors (keys) and the labels to use for the UI.
   * This can be used to overwrite the default value, for example, to have the UI translated in a language different from English.
   * Its presence does not impact functionality.
   */
  connector: PropTypes.shape({
    _and: PropTypes.string,
    _or: PropTypes.string,
  }),
}

export { Search }
