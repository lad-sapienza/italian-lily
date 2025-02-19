import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { GeoJSON, LayersControl, useMap } from "react-leaflet";
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
  icon,
}) => {
  const [geojsonData, setGeojsonData] = useState(null);
  const [error, setError] = useState(false);
  const map = useMap();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDataFromSource(source);

        // Conta le occorrenze per ciascun punto
        const locationCounts = data.reduce((acc, item) => {
          const location = item.f_luoghi_id?.nome_localita;
          if (location) {
            acc[location] = (acc[location] || 0) + 1;
          }
          return acc;
        }, {});

        console.log("Conteggio delle occorrenze:", locationCounts);

        // Trasforma i dati in GeoJSON
        const transformedData = data
          .map((item) => {
            const geometry = item.f_luoghi_id?.coordinate;
            if (geometry && geometry.coordinates) {
              return {
                type: "Feature",
                geometry,
                properties: {
                  ...item,
                  count: locationCounts[item.f_luoghi_id?.nome_localita] || 0,
                },
              };
            } else {
              console.warn("Geometria non valida:", item);
              return null;
            }
          })
          .filter(Boolean);

        const geoJSON = {
          type: "FeatureCollection",
          features: transformedData,
        };

        console.log("GeoJSON costruito:", geoJSON);

        setGeojsonData(geoJSON);

        // Adatta la mappa al contenuto
        if (fitToContent && geoJSON.features.length > 0) {
          const bounds = geoJSON.features.map((feature) => {
            const [lng, lat] = feature.geometry.coordinates;
            return [lat, lng];
          });
          map.fitBounds(bounds);
        }
      } catch (err) {
        console.error("Errore durante il recupero o la trasformazione:", err);
        setError(true);
      }
    };

    fetchData();
  }, [source, fitToContent, map]);

  useEffect(() => {
    if (geojsonData && map) {
      const clusterGroup = L.markerClusterGroup();

      geojsonData.features.forEach((feature) => {
        const [lng, lat] = feature.geometry.coordinates;

        // Calcola il colore in base al valore di "ipotizzato"
        const isIpotizzato = feature.properties.ipotizzato;
        const color = isIpotizzato ? "red" : "green";

        console.log("Feature properties:", feature.properties);
        console.log(`Feature ipotizzato: ${isIpotizzato}, color: ${color}`);

        // Configura il marker con le opzioni
        const markerOptions = {
          color: color, // Colore del bordo
          fillColor: color, // Colore di riempimento
          fillOpacity: 0.6,
          radius: 8,
        };

        console.log("Marker options:", markerOptions);

        const marker = L.circleMarker([lat, lng], markerOptions);

        // Verifica se popupTemplate è una funzione o una stringa
        const popupContent =
          typeof popupTemplate === "function"
            ? popupTemplate(feature) // Chiama la funzione con il feature
            : popupTemplate.replace(/\${(.*?)}/g, (_, key) => feature.properties[key] || "");

        marker.bindPopup(popupContent);
        clusterGroup.addLayer(marker);
      });

      map.addLayer(clusterGroup);

      return () => {
        map.removeLayer(clusterGroup);
      };
    }
  }, [geojsonData, map, icon, popupTemplate]);

  if (error) {
    return <div className="text-danger">Error rendering the vector layer</div>;
  }

  return null;
};

VectorLayer.propTypes = {
  source: PropTypes.shape({
    dTable: PropTypes.string.isRequired,
    dToken: PropTypes.string,
    geoField: PropTypes.string.isRequired,
  }).isRequired,
  name: PropTypes.string.isRequired,
  popupTemplate: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  checked: PropTypes.bool,
  fitToContent: PropTypes.bool,
  icon: PropTypes.shape({
    type: PropTypes.string,
    options: PropTypes.object,
  }),
};

export { VectorLayer };
