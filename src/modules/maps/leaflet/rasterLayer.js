import React from "react"
import PropTypes from "prop-types"
import { TileLayer, LayersControl } from "react-leaflet"

const RasterLayer = ({ name, url, checked, attribution, asOverlay }) => {
  if (asOverlay) {
    return (
      <LayersControl.Overlay checked={checked} name={name}>
        <TileLayer url={url} attribution={attribution ? attribution : false} />
      </LayersControl.Overlay>
    )
  }
  return (
    <LayersControl.BaseLayer checked={checked} name={name}>
      <TileLayer url={url} attribution={attribution ? attribution : false} />
    </LayersControl.BaseLayer>
  )
}

RasterLayer.propTypes = {
  /**
   * Name of the baselayer to show in Layer control.
   * Required
   */
  name: PropTypes.string.isRequired,
  /**
   * URL where raster tiles are found.
   * Required
   */
  url: PropTypes.string.isRequired,
  /**
   * Property to control the layer's default visibility ion the map and control panel
   * Default: false
   */
  checked: PropTypes.bool,
  /**
   * Attribution or credits for the layer
   */
  attribution: PropTypes.string,
  /**
   * If true the layer will be listed in the Overlay list; if false (default) in the base-layers list
   */
  asOverlay: PropTypes.bool

}
export { RasterLayer }
