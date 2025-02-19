import React from "react"
import { Source, Layer } from "react-map-gl//maplibre"
import PropTypes from "prop-types"

/**
 * RasterLayerLibre component renders a raster layer on a MapLibre map.
 *
 * @param {Object} props - The properties for the component.
 * @param {string} props.name - The name of the layer to be displayed in the Control Panel.
 * @param {string|string[]} props.url - The URL(s) of the raster tiles. Can be a single string or an array of strings.
 * @param {boolean} props.checked - Determines if the layer is visible or not. If true, the layer is displayed.
 * @param {string} [props.attribution] - Optional attribution or credits for the layer.
 *
 * @returns {JSX.Element} The rendered raster layer component.
 */
const RasterLayerLibre = ({ name, url, checked, attribution }) => {
  // Convert the URL prop into an array if it's not already one
  const tileUrls = Array.isArray(url) ? url : [url]

  return (
    <Source type="raster" tiles={tileUrls}>
      <Layer
        type="raster"
        minzoom={0}
        maxzoom={22}
        layout={{
          visibility: checked ? "visible" : "none",
        }}
        metadata={{
          label: name,
        }}
        attribution={attribution || null}
      />
    </Source>
  )
}

RasterLayerLibre.propTypes = {
  /**
   * Name of the layer to be shown in Control Panel
   */
  name: PropTypes.string,
  /**
   * String with URL of tiles or array with multiple URLs
   */
  url: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  /**
   * Boolean: if true, the layer will be turned on
   */
  checked: PropTypes.bool,
  /**
   * Attribution or credids for the layer
   */
  attribution: PropTypes.string,
}
export { RasterLayerLibre }
