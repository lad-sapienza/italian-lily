import * as React from "react"
import { useState, useCallback } from "react"
import "maplibre-gl/dist/maplibre-gl.css"
import Map, {
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  Popup,
} from "react-map-gl/maplibre"
import PropTypes from "prop-types"
import SimpleControl from "./simpleControl"
import { RasterLayerLibre } from "./rasterLayerLibre"
import {
  defaultBaseLayers,
  defaultBaseLayersPropTypes,
} from "../../maps/defaultBaseLayers"
import parseStringTemplate from "../../../services/parseStringTemplate"
import { withPrefix } from "gatsby"

const MapLibre = ({
  children,
  height = "800px",
  center = "0,0,2",
  mapStyle,
  geolocateControl,
  fullscreenControl,
  navigationControl,
  scaleControl,
  baseLayers,
}) => {
  const [lng, lat, zoom] = center.split(",").map(Number)
  if (mapStyle) {
    mapStyle = mapStyle.startsWith("http") ? mapStyle : withPrefix(mapStyle)
  }

  const [clickInfo, setClickInfo] = useState(null)
  const [interactiveLyrs, setInteractiveLyrs] = useState([])

  const updateInteractiveLayers = useCallback(event => {
    const mapInstance = event.target
    const layers = mapInstance.getStyle()?.layers || []

    // Log per vedere tutti i layer presenti nella mappa
    const interactiveLayers = layers
      .filter(layer => layer.metadata?.popupTemplate)
      .map(layer => layer.id)
    setInteractiveLyrs(interactiveLayers)
  }, [])

  const onMapLoad = useCallback(event => {
    const mapInstance = event.target

    // test custom control
    const customControl = new SimpleControl()
    mapInstance.addControl(customControl, "top-right")
  }, [])

  const onClick = useCallback(
    event => {
      const { lngLat, point, target: mapInstance } = event

      // Use queryRenderedFeatures to get features at the clicked point
      const clickedFeatures = mapInstance.queryRenderedFeatures(point, {
        layers: interactiveLyrs,
      })

      const clickedFeature = clickedFeatures.find(feature =>
        interactiveLyrs.includes(feature.layer.id),
      )

      setClickInfo(
        clickedFeature ? { feature: clickedFeature, lngLat: lngLat } : null,
      )
    },
    [interactiveLyrs],
  )

  // Filtra i base layers in base alla proprietà `baseLayers`
  const filteredBaseLayers = baseLayers
    ? baseLayers
        .map(lyr => (defaultBaseLayers[lyr] ? defaultBaseLayers[lyr] : null))
        .filter(x => x)
    : []

  return (
    <React.Fragment>
      <Map
        initialViewState={{
          longitude: lng,
          latitude: lat,
          zoom: zoom,
        }}
        style={{ height: height }}
        mapStyle={mapStyle}
        onLoad={onMapLoad}
        onClick={onClick}
        onData={updateInteractiveLayers}
        onSourceData={updateInteractiveLayers}
        onStyleData={updateInteractiveLayers}
      >
        {filteredBaseLayers &&
          filteredBaseLayers.map((obj, i) => (
            <RasterLayerLibre
              key={i}
              name={obj.name}
              url={[obj.url]}
              checked={i === 0}
              attribution={obj.attribution}
            />
          ))}

        {children}
        {clickInfo && clickInfo.feature.layer.metadata.popupTemplate && (
          <Popup
            anchor="top"
            longitude={clickInfo.lngLat.lng}
            latitude={clickInfo.lngLat.lat}
            onClose={() => setClickInfo(null)}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: parseStringTemplate(
                  clickInfo.feature.layer.metadata.popupTemplate,
                  clickInfo.feature.properties,
                ),
              }}
            />
          </Popup>
        )}

        {geolocateControl && <GeolocateControl position={geolocateControl} />}
        {fullscreenControl && (
          <FullscreenControl position={fullscreenControl} />
        )}
        {navigationControl && (
          <NavigationControl position={navigationControl} />
        )}
        {scaleControl && <ScaleControl position={scaleControl} />}
      </Map>
    </React.Fragment>
  )
}

MapLibre.propTypes = {
  /**
   * Height (with units) of the map to render
   * Optional. Default: "800px"
   */
  height: PropTypes.string,
  /**
   * Center of the initial map, in the shape of long,lat,zoom (string, comma-separated)
   * Optional. Default: "0,0,2"
   */
  center: PropTypes.string,
  /**
   * URL of the JSON mapstyle file
   * Optional. Default: null
   */
  mapStyle: PropTypes.string,
  /**
   * Position in the map frame of the Geolocate Control. If not provided, the Geolocate Controle will not be shown
   * Can be one of the following: "top-right", "top-left", "bottom-right", "bottom-left"
   * Default: false
   */
  geolocateControl: PropTypes.oneOf([
    "top-right",
    "top-left",
    "bottom-right",
    "bottom-left",
  ]),
  /**
   * Position in the map frame of the Fullscreen Control. If not provided, the Fullscreen Controle will not be shown
   * Can be one of the following: "top-right", "top-left", "bottom-right", "bottom-left"
   * Default: false
   */
  fullscreenControl: PropTypes.oneOf([
    "top-right",
    "top-left",
    "bottom-right",
    "bottom-left",
  ]),
  /**
   * Position in the map frame of the Navigation Control. If not provided, the Navigation Controle will not be shown
   * Can be one of the following: "top-right", "top-left", "bottom-right", "bottom-left"
   * Default: false
   */
  navigationControl: PropTypes.oneOf([
    "top-right",
    "top-left",
    "bottom-right",
    "bottom-left",
  ]),
  /**
   * Position in the map frame of the Scale Control. If not provided, the Scale Controle will not be shown
   * Can be one of the following: "top-right", "top-left", "bottom-right", "bottom-left"
   * Default: false
   */
  scaleControl: PropTypes.oneOf([
    "top-right",
    "top-left",
    "bottom-right",
    "bottom-left",
  ]),
  /**
   * An adday with the identifiers of the default raster base layers to show in the map.
   * Can be one or more of the following: "CAWM", "OSM", "EsriSatellite","EsriStreets", "EsriTopo", "GoogleSatellite", "GoogleRoadmap", "GoogleTerrain", "GoogleAlteredRoadmap", "GoogleTerrainOnly", "GoogleHybrid", "CartoDb", "StamenTerrain", "OSMMapnick", "OSMCycle",
   * Default: null
   */
  baseLayers: defaultBaseLayersPropTypes,
}

export { MapLibre }
