import PropTypes from "prop-types"

const sourcePropTypes = PropTypes.shape({
  /**
   * Path to GeoJSON data: might be a local path or an URL.
   * Required if dEndPoint or dTable are not set
   */
  path2data: PropTypes.string,
  /**
   * Directus endpoint.
   * Required if either dTable (and env GATSBY_DIRECTUS_ENDPOINT) or path2data are not set
   */
  dEndPoint: PropTypes.string,
  /**
   * Directus table name, to be used if env variable GATSBY_DIRECTUS_ENDPOINT is set.
   * Required if neither path2data or dEndPoit are set
   */
  dTable: PropTypes.string,
  /**
   * Directus optional filters and other, provided as querystring compatible to Directus API
   */
  dQueryString: PropTypes.string,
  /**
   * Directus access token.
   * Required if env variable GATSBY_DIRECTUS_TOKEN is not set
   */
  dToken: PropTypes.string,
  /**
   * Id of a specific record to retrieve
   */
  id: PropTypes.number,
  /**
   * Tranformation to apply to data
   */
  transType: PropTypes.oneOf(["text", "csv2json", "json", "geojson"]),
})

export default sourcePropTypes
