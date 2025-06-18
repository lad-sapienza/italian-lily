import React, { useEffect, useState } from "react"
import PropTypes from "prop-types"
import withLocation from "../../services/withLocation"
import getDataFromSource from "../../services/getDataFromSource"

// Create a context for the record data
export const RecordContext = React.createContext()

/**
 * RecordNotWrapped component fetches and provides record data based on the search parameters.
 * It handles loading and error states, and renders children once data is available.
 *
 * @param {Object} props - Component props
 * @param {Object} props.search - Object containing search parameters
 * @param {string} props.search.tb - Directus table name
 * @param {string} props.search.endPoint - Directus endpoint
 * @param {string} props.search.token - Directus token
 * @param {string} props.search.id - Record ID
 * @param {string} props.search.fields - Record fields to fetch
 * @param {ReactNode} props.children - Child components to render
 * @returns {JSX.Element} The rendered component
 */
const RecordNotWrapped = ({ search, children, fields = null }) => {
  const { tb, endPoint, token, id } = search // Destructure search parameters
  const [recordData, setRecordData] = useState([]) // State to hold fetched record data
  const [loading, setLoading] = useState(false) // State to manage loading status
  const [error, setError] = useState(null) // State to manage error messages

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDataFromSource({
          dEndPoint: endPoint,
          dTable: tb,
          dQueryString : fields && `fields=${fields}`,
          transType: "json",
          id: id,
        })
        setRecordData(data) // Set the fetched data to state
      } catch (err) {
        setError(err) // Set error if fetching fails
      } finally {
        setLoading(false) // Set loading to false after fetching
      }
    }

    fetchData() // Call the fetch function
  }, [endPoint, tb, token, id, fields]) // Dependencies for useEffect

  if (loading) {
    return <div className="text-info">Loading...</div>
  }

  if (error) {
    console.error(error) // Log the error for debugging
    return (
      <div className="text-danger">
        {error.message}
        <br />
        More info in the console log
      </div>
    )
  }
  // Render no results found state
  if (recordData.length === 0) {
    return <div className="text-warning">No result found</div>
  }

  return (
    <RecordContext.Provider value={recordData}>
      {children}
    </RecordContext.Provider>
  )
}

// Wrap the component with location context
const Record = withLocation(RecordNotWrapped)

Record.propTypes = {
  search: PropTypes.shape({
    /**
     * Directus table name
     */
    tb: PropTypes.string,
    /**
     * Directus endpoint, if env variable GATSBY_DIRECTUS_ENDPOINT is not available
     */
    endPoint: PropTypes.string,
    /**
     * Directus endpoint, if env variable GATSBY_DIRECTUS_TOKEN is not available
     */
    token: PropTypes.string,
    /**
     * Record id
     */
    id: PropTypes.string,
    /**
     * Record fields to fetch, following: https://docs.directus.io/reference/query.html#fields
     */
    fields: PropTypes.string,
  }),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]).isRequired,
}
export { Record }
