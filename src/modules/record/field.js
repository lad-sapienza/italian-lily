import React, { useContext } from "react"
import PropTypes from "prop-types"
import { RecordContext } from "./record"
import getDataFromObj from "../../services/transformers/getDataFromObj"

/**
 * Field component retrieves and displays data from the RecordContext.
 * It allows for optional transformation of the data before rendering.
 *
 * @param {Object} props - The component props.
 * @param {Array<string>} props.name - An array of strings representing the keys or indices of the data to retrieve.
 * @param {Function} [props.transformer] - An optional function to transform the retrieved data before rendering.
 *
 * @returns {JSX.Element|null} The rendered component or null if no data is available.
 */
const Field = ({ name, transformer }) => {
  // Retrieve the current value from the RecordContext
  const value = useContext(RecordContext)

  // If the value is empty, return null (no rendering)
  if (!value) {
    return null // Use null instead of an empty fragment for better performance
  }

  // Get the relevant data based on the provided name
  const data = getDataFromObj(value, name)

  if (transformer) {
    return transformer(data)
  }

  if (typeof data === "string") {
    return data
  }

  return <React.Fragment>{JSON.stringify(data, null, 2)}</React.Fragment>
}

// Define prop types for the Field component
Field.propTypes = {
  /**
   * Array containing the index or the indices of the data to return.
   * Required.
   * Example: data = {"one": "One Value", "two": ["Two value #1", "Two value 2"]}
   * name: ["one"] will return "One Value" and name: ["two", "1"] will return "Two value 2".
   */
  name: PropTypes.arrayOf(PropTypes.string).isRequired,

  /**
   * A function that receives data as input and performs transformation
   * or any other type of logic. Can be used, for example, to loop into an array of child data.
   * Optional. By default, if output data is not a string, JSON.stringify will be applied to returned data.
   */
  transformer: PropTypes.func,
}

export { Field }
