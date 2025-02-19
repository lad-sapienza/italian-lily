import React, { useContext, memo } from "react"
import PropTypes from "prop-types"
import { RecordContext } from "./record"
import getDataFromObj from "../../services/transformers/getDataFromObj"

// Image component to display images based on the provided field name and index.
// It retrieves data from the RecordContext and constructs the image URL.
const Image = memo(
  ({
    fieldName,
    index = 0,
    dEndPoint = process.env.GATSBY_DIRECTUS_ENDPOINT,
    preset = null,
    custom = null,
    className = null,
  }) => {
    // Retrieve the current value from the RecordContext
    const value = useContext(RecordContext)

    // If the value is empty, return null (no rendering)
    if (!value) return null // Use null instead of an empty fragment for better performance

    // Get the relevant data based on the provided field name
    const data = getDataFromObj(value, [fieldName])

    // Function to construct and render the image element
    const showImage = ({ directus_files_id }) => {
      const imgPath = `${dEndPoint}/assets/${directus_files_id.id}/${directus_files_id.filename_download}${preset ? `?key=${preset}` : custom ? `?${custom}` : ""}`

      return (
        <img
          src={imgPath}
          alt={
            directus_files_id.description || directus_files_id.filename_download
          }
          className={className || null}
        />
      )
    }

    // Render images based on the index
    return index === "all" ? (
      <>
        {data.map((img, key) => (
          <React.Fragment key={key}>{showImage(img)}</React.Fragment>
        ))}
      </>
    ) : (
      showImage(data[index])
    )
  },
)

// PropTypes for type checking and documentation
Image.propTypes = {
  fieldName: PropTypes.string.isRequired, // Required: name of the field to retrieve image data
  index: PropTypes.oneOfType([
    PropTypes.oneOf(["all"]) , // Can be "all" to show all images
    PropTypes.number, // Or a specific index for a single image
  ]),
  dEndPoint: PropTypes.string, // Optional: custom endpoint for fetching images
  preset: PropTypes.string, // Optional: preset key for image transformation
  custom: PropTypes.string, // Optional: custom query parameters for the image URL
  className: PropTypes.string, // Optional: CSS class for styling the image
}

export { Image }
