import React from "react";
import PropTypes from "prop-types";
import { MapContainer, LayersControl, ZoomControl } from "react-leaflet";

import { RasterLayer } from "./rasterLayer";
import { defaultBaseLayers, defaultBaseLayersPropTypes } from "../defaultBaseLayers";

const MapLeaflet = ({
  height,
  center,
  baseLayers,
  children,
  scrollWheelZoom = true,           // <- wheel abilitata di default
  layersControlPosition = "topright",
  zoomControlPosition = "bottomleft" // <- pulsanti +/- visibili e spostati in basso a sinistra
}) => {
  if (!center) center = "0,0,2";
  let [lat, lng, zoom] = center?.split(",").map(e => parseFloat(e.trim())); // <- lat, lng

  return (
    <MapContainer
      style={{ height: height ? height : `800px` }}
      scrollWheelZoom={!!scrollWheelZoom}
      center={[lat, lng]}
      zoom={zoom}
      zoomControl={false} // disattivo il default, poi aggiungo ZoomControl con posizione custom
    >
      <ZoomControl position={zoomControlPosition} />

      <LayersControl position={layersControlPosition ? layersControlPosition : undefined}>
        {baseLayers && baseLayers.map((layer, index) => {
          let bl = layer.trim();
          if (!defaultBaseLayers.hasOwnProperty(bl)) return null;
          return (
            <RasterLayer
              key={index}
              name={defaultBaseLayers[bl].name}
              url={defaultBaseLayers[bl].url}
              attribution={defaultBaseLayers[bl].attribution || null}
              checked={index === 0}
            />
          );
        })}
        {children}
      </LayersControl>
    </MapContainer>
  );
};

MapLeaflet.propTypes = {
  height: PropTypes.string,
  center: PropTypes.string,
  baseLayers: defaultBaseLayersPropTypes,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.element), PropTypes.element]),
  scrollWheelZoom: PropTypes.bool,
  layersControlPosition: PropTypes.oneOf(["topright", "topleft", "bottomright", "bottomleft"]),
  zoomControlPosition: PropTypes.oneOf(["topright", "topleft", "bottomright", "bottomleft"])
};

export { MapLeaflet };
