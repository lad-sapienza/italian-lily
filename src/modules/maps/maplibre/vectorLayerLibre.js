import React, { useState, useEffect, useCallback } from "react"
import { Source, Layer, useMap } from "react-map-gl/maplibre"
import PropTypes from "prop-types"
import * as bbox from "geojson-bbox"
import getDataFromSource from "../../../services/getDataFromSource"
import sourcePropTypes from "../../../services/sourcePropTypes"
import fieldsPropTypes from "../../../services/fieldsPropTypes"

/**
 * VectorLayerLibre component renders a vector layer on a map using GeoJSON data.
 * It manages the layer's style, visibility, and data fetching.
 *
 * @param {Object} props - Component properties
 * @param {Object} props.source - Data source for the GeoJSON
 * @param {string} props.refId - Reference ID for the layer
 * @param {Object} props.style - Style configuration for the layer
 * @param {string} props.name - Name of the layer
 * @param {Array} props.searchInFields - Fields to search in
 * @param {boolean} props.fitToContent - Whether to fit the map to the content
 * @param {boolean} props.checked - Whether the layer is checked/visible
 * @param {string} props.popupTemplate - Template for popups
 * @returns {JSX.Element} Rendered component
 */
const VectorLayerLibre = ({
  source,
  refId,
  style = {},
  name,
  searchInFields,
  fitToContent,
  checked,
  popupTemplate,
}) => {
  // State to hold GeoJSON data and error messages
  const [geojsonData, setGeojson] = useState(null)
  const [error, setError] = useState(null)
  const { current: mapRef } = useMap()

  // Initialize style metadata with provided props
  style.metadata = {
    ...style.metadata,
    label: name,
    searchInFields,
    popupTemplate,
  }

  // Set layer visibility based on the checked prop
  if (checked === false) {
    style.layout = {
      ...style.layout,
      visibility: "none",
    }
  }

  /**
   * Updates the layer style on the map when the style or map reference changes.
   */
  const updateLayerStyle = useCallback(() => {
    if (!mapRef) return

    const mapInstance = mapRef.getMap()

    // Applica `styledata` per assicurarsi che le modifiche avvengano dopo il caricamento dello stile
    mapInstance.on("styledata", () => {
      const layer = mapInstance.getLayer(refId)
      if (layer) {
        // Update layout properties if defined
        if (style.layout) {
          Object.keys(style.layout).forEach(key => {
            mapInstance.setLayoutProperty(refId, key, style.layout[key])
          })
        }
        // Update paint properties if defined
        if (style.paint) {
          Object.keys(style.paint).forEach(key => {
            mapInstance.setPaintProperty(refId, key, style.paint[key])
          })
        }

        // Update layer metadata
        layer.metadata = {
          ...layer.metadata,
          ...style.metadata,
        }
      }
    })
  }, [mapRef, style, refId])

  /**
   * Fits the map view to the bounds of the GeoJSON data.
   */
  const fitLayerToBounds = useCallback(() => {
    if (mapRef && geojsonData && fitToContent) {
      const mapInstance = mapRef.getMap()
      const [minLng, minLat, maxLng, maxLat] = bbox(geojsonData)
      mapInstance.fitBounds([
        [minLng, minLat],
        [maxLng, maxLat],
      ])
    }
  }, [mapRef, geojsonData, fitToContent])

  // Effect to update layer style and fit bounds when the map reference changes
  useEffect(() => {
    if (mapRef) {
      updateLayerStyle()
      fitLayerToBounds()
    }
  }, [mapRef, updateLayerStyle, fitLayerToBounds])

  // Effect to fetch GeoJSON data when the component mounts or refId changes
  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        source.transType = "geojson"
        const geoJSON = await getDataFromSource(source)
        setGeojson(geoJSON) // Imposta i dati geoJSON originali
      } catch (err) {
        console.error("Errore nel caricamento dei dati:", err)
        setError("Errore nel caricamento dei dati")
      }
    }
    if (!refId) {
      fetchGeoData() // Fetch data if refId is not provided
    }
  }, [refId, source])

  // Render error message if there's an error
  if (error) {
    return <div>{error}</div>
  }

  // Render loading message if GeoJSON data is not yet available
  if (!geojsonData) {
    return <div>Caricamento dati...</div>
  }

  // Render the Source and Layer components with the GeoJSON data
  return (
    <div>
      {/* Mostra il Source solo se ci sono dati GeoJSON */}
      <Source type="geojson" data={geojsonData}>
        <Layer {...style} />
      </Source>
    </div>
  )
}

// PropTypes for type checking and documentation
VectorLayerLibre.propTypes = {
  /**
   * Object with information to source data
   */
  source: sourcePropTypes,
  /**
   * Reference ID for the layer, as defined in the external styles.json file. It is used to oveerride the layer name / style / popup etc.
   */
  refId: PropTypes.string,
  /**
   * Layer name to use in the Layer control
   * Required
   */
  name: PropTypes.string.isRequired,
  /**
   * A string containing the HTML to render in the popup. Variable props can be injected using ${field_name} syntax
   * Optional
   */
  popupTemplate: PropTypes.string,
  /**
   * If true, the layer will be shown (tuned on).
   */
  checked: PropTypes.bool,
  /**
   * If true, the map will be zoomed and panned to show full extents of the layer added
   */
  fitToContent: PropTypes.bool,
  /**
   * Style object relative to layer
   * For the complete documentation see: https://maplibre.org/maplibre-style-spec/layers/
   */
  style: PropTypes.object,
  /**
   * List of fields that will be exposed to the search interface
   * If missing the layer will NOT be searcheable
   */
  searchInFields: fieldsPropTypes,
}

export { VectorLayerLibre }
