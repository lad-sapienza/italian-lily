import PropTypes from "prop-types"

/**
 * `fieldsPropTypes` is a PropTypes definition that specifies the expected shape of 
 * an object used in the application. It can be one of two types:
 * 
 * 1. An object where the keys are strings (fieldnames) and the values are also strings (field labels). This is 
 *    useful for scenarios where you want to define a mapping of field names to 
 *    their corresponding label values.
 * 
 * 2. An object that conforms to a specific shape defined by PropTypes.shape. This 
 *    shape includes:
 *    - `label`: A string that represents the label of the field.
 *    - `values`: An array of strings that contains the possible values for the field.
 */
const fieldsPropTypes = PropTypes.oneOfType([
  PropTypes.objectOf(PropTypes.string),
  PropTypes.shape({
    label: PropTypes.string,
    values: PropTypes.arrayOf(PropTypes.string),
  }),
]);

export default fieldsPropTypes
