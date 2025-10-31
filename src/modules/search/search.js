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

/**
 * Deep clone helper (safe for plain objects)
 */
const deepClone = obj => JSON.parse(JSON.stringify(obj || {}))

/**
 * Espande le chiavi "virtuali" nel filtro Directus:
 * - se trova { people: { _icontains: "x" } } lo sostituisce con
 *   { _or: [ { path1: { _icontains: "x" } }, { path2: { _icontains: "x" } }, ... ] }
 * - funziona ricorsivamente su qualunque profondità e non modifica gli altri campi.
 */
const pathToNestedFilter = (path, ops) =>
  path.split(".").reverse().reduce((acc, key) => ({ [key]: acc }), JSON.parse(JSON.stringify(ops)));
function expandVirtualFieldsInFilter(filterObj, virtualFieldsMap = {}) {
  if (!filterObj || typeof filterObj !== "object") return filterObj

  // se è un array, processa ogni elemento
  if (Array.isArray(filterObj)) {
    return filterObj.map(node => expandVirtualFieldsInFilter(node, virtualFieldsMap))
  }

  // è un oggetto
  const out = {}
  let pendingOr = [] // raccoglie eventuali _or generati da chiavi virtuali a questo livello

  for (const [key, val] of Object.entries(filterObj)) {
    if (virtualFieldsMap[key]) {
      // Caso 1: l'oggetto è del tipo { people: { _icontains: "x", ... } }
      // Convertiamo in un blocco _or mantenendo tutti gli operatori presenti in "val"
      const ops = (val && typeof val === "object") ? val : {}
      const realFields = virtualFieldsMap[key]

      const orChunk = realFields.map(path => pathToNestedFilter(path, ops))
      pendingOr = pendingOr.concat(orChunk)
      // NON copiamo la chiave virtuale dentro 'out'
    } else {
      // Ricorsione standard
      out[key] = expandVirtualFieldsInFilter(val, virtualFieldsMap)
    }
  }

  // Se abbiamo generato clausole OR a questo livello:
  if (pendingOr.length > 0) {
    // Se esiste già un _or, uniamoli
    if (Array.isArray(out._or)) {
      out._or = out._or.concat(pendingOr)
    } else {
      out._or = pendingOr
    }
  }

  return out
}

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
  /**
   * Mappa di alias → array di campi reali (Directus path)
   * Esempio:
   * {
   *   people: [
   *     "personalita_coinvolte.f_persone_id.nome_e_cognome",
   *     "personalita_coinvolte.f_persone_id.cognome_naturalizzato_o_coniuge",
   *     "personalita_coinvolte.f_persone_id.Pseudonimo",
   *     "personalita_coinvolte.f_persone_id.other_attested_names",
   *   ]
   * }
   */
  virtualFields = {},
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
      // 1) filtro "grezzo" da plain2directus (usa la struttura restituita da SearchUI)
      const rawFilterObj = plain2directus(conn, inputs)

      // 2) espansione campi virtuali (es. people -> _or su 4 campi)
      const expandedFilterObj = expandVirtualFieldsInFilter(rawFilterObj, virtualFields)

      // 3) stringify per Directus
      const filter = JSON.stringify(expandedFilterObj)

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

  const createNewSource = (src, filter) => {
    const newSource = structuredClone(src)
    newSource.transType = "json"
    newSource.dQueryString = `${src.dQueryString ? `${newSource.dQueryString}&` : ""}filter=${filter}`
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

  /**
   * Mappa alias → array di campi reali per la ricerca multi-campo.
   * Non impatta l'UI; serve solo per trasformare il filtro prima della chiamata a Directus.
   */
  virtualFields: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
}

export { Search }
