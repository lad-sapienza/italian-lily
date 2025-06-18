import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster/dist/leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import getDataFromSource from "../../../services/getDataFromSource";

const VectorLayer = ({
  source,
  name,
  popupTemplate,
  checked = false,
  fitToContent = false,
  style,
  cluster = true,
  pointToLayer,
  clusterToLayer,
}) => {
  const [geojsonData, setGeojsonData] = useState(null);
  const [error, setError] = useState(false);
  const map = useMap();

  // Stile predefinito con gradiente di colore
  const defaultStyle = (feature) => {
    const count = feature?.properties?.count || 1;
    const intensity = Math.min(count / 10, 1);
    const hue = (1 - intensity) * 240; // Blu (freddo) -> Rosso (caldo)
    
    return {
      fillColor: `hsl(${hue}, 80%, 70%)`,
      color: '#ffffff',
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.6,
      radius: 8 + Math.sqrt(count) * 2
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDataFromSource(source);

        // Conta le occorrenze per ciascuna località
        const locationCounts = data.reduce((acc, item) => {
          const location = item.f_luoghi_id?.nome_localita;
          if (location) {
            acc[location] = (acc[location] || 0) + 1;
          }
          return acc;
        }, {});

        // Trasforma in GeoJSON con conteggi
        const geoJSON = {
          type: "FeatureCollection",
          features: data
            .map(item => {
              const geometry = item.f_luoghi_id?.coordinate;
              if (geometry?.coordinates) {
                return {
                  type: "Feature",
                  geometry,
                  properties: {
                    ...item,
                    count: locationCounts[item.f_luoghi_id?.nome_localita] || 1,
                  },
                };
              }
              return null;
            })
            .filter(Boolean)
        };

        setGeojsonData(geoJSON);

        // Adatta la mappa al contenuto se richiesto
        if (fitToContent && geoJSON.features.length > 0) {
          const bounds = L.latLngBounds(
            geoJSON.features.map(f => {
              const [lng, lat] = f.geometry.coordinates;
              return [lat, lng];
            })
          );
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (err) {
        console.error("Errore nel caricamento dati:", err);
        setError(true);
      }
    };

    fetchData();
  }, [source, fitToContent, map]);

  useEffect(() => {
    if (!geojsonData || !map) return;

    let layerGroup;
    
    if (cluster) {
      // Configurazione cluster
      layerGroup = L.markerClusterGroup({
        chunkedLoading: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true,
        maxClusterRadius: 40,
        iconCreateFunction: (cluster) => {
          const childCount = cluster.getChildCount();
          const intensity = Math.min(childCount / 10, 1);
          const hue = (1 - intensity) * 240;
          
          return L.divIcon({
            html: `<div style="background-color: hsla(${hue}, 80%, 70%, 0.6);
                   color: white; 
                   width: ${30 + Math.sqrt(childCount) * 5}px; 
                   height: ${30 + Math.sqrt(childCount) * 5}px;
                   border-radius: 50%;
                   display: flex;
                   align-items: center;
                   justify-content: center;
                   border: 2px solid white;
                   font-weight: bold;">${childCount}</div>`,
            className: 'marker-cluster-custom'
          });
        }
      });

      // Aggiungi i marker al cluster
      geojsonData.features.forEach(feature => {
        const [lng, lat] = feature.geometry.coordinates;
        const marker = pointToLayer 
          ? pointToLayer(feature, [lat, lng])
          : L.circleMarker([lat, lng], style?.(feature) || defaultStyle(feature));
        
        if (popupTemplate) {
          const content = typeof popupTemplate === 'function'
            ? popupTemplate(feature)
            : popupTemplate;
          marker.bindPopup(content);
        }
        
        layerGroup.addLayer(marker);
      });

      map.addLayer(layerGroup);
    } else {
      // Senza clustering
      layerGroup = L.geoJSON(geojsonData, {
        pointToLayer: pointToLayer || ((feature, latlng) => {
          return L.circleMarker(latlng, style?.(feature) || defaultStyle(feature));
        }),
        onEachFeature: (feature, layer) => {
          if (popupTemplate) {
            const content = typeof popupTemplate === 'function'
              ? popupTemplate(feature)
              : popupTemplate;
            layer.bindPopup(content);
          }
        }
      });

      map.addLayer(layerGroup);
    }

    return () => {
      if (layerGroup) map.removeLayer(layerGroup);
    };
  }, [geojsonData, map, style, popupTemplate, cluster, pointToLayer, clusterToLayer]);

  if (error) {
    return <div className="text-danger">Errore nel rendering del layer vettoriale</div>;
  }

  return null;
};

VectorLayer.propTypes = {
  source: PropTypes.shape({
    dTable: PropTypes.string.isRequired,
    dToken: PropTypes.string,
    geoField: PropTypes.string.isRequired,
    dQueryString: PropTypes.string,
  }).isRequired,
  name: PropTypes.string.isRequired,
  popupTemplate: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  checked: PropTypes.bool,
  fitToContent: PropTypes.bool,
  style: PropTypes.func,
  cluster: PropTypes.bool,
  pointToLayer: PropTypes.func,
  clusterToLayer: PropTypes.func,
};

export { VectorLayer };