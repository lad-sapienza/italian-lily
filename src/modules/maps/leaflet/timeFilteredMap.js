import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { MapLeaflet, VectorLayer } from "../../scms";

const TimeFilteredMap = ({ height, baseLayers, source }) => {
  const [currentYear, setCurrentYear] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);
  const [minYear, setMinYear] = useState(null);
  const [maxYear, setMaxYear] = useState(null);
  const [error, setError] = useState(null);

  // Recupera i dati iniziali
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!source.dEndPoint || !source.dTable || !source.dQueryString) {
          throw new Error("Uno o più parametri di `source` sono mancanti o non validi.");
        }

        const response = await fetch(
          `${source.dEndPoint}/items/${source.dTable}?${source.dQueryString}`,
          {
            headers: {
              Authorization: `Bearer ${source.dToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.data || !Array.isArray(result.data)) {
          throw new Error("La risposta dell'API non contiene dati validi.");
        }

        console.log("Dati caricati:", result.data);
        setData(result.data);

        // Calcola gli anni validi
        const validYears = result.data
          .map(item => item.prima_attestazione_anno)
          .filter(year => typeof year === "number" && !isNaN(year));

        if (validYears.length > 0) {
          const min = Math.min(...validYears);
          const max = Math.max(...validYears);

          setMinYear(min);
          setMaxYear(max);
          setCurrentYear(min);
        } else {
          console.warn("Nessun anno valido trovato nei dati.");
        }
      } catch (err) {
        console.error("Errore durante il recupero dei dati:", err.message);
        setError(err.message);
      }
    };

    fetchData();
  }, [source]);

  // Filtra i dati in base all'anno corrente
  useEffect(() => {
    if (currentYear !== null) {
      const filtered = data.filter(
        item => (item.prima_attestazione_anno || Infinity) <= currentYear
      );
      console.log(`Dati filtrati per l'anno ${currentYear}:`, filtered);
      setFilteredData(filtered);
    }
  }, [currentYear, data]);

  return (
    <div>
      {/* Messaggio di errore */}
      {error && (
        <div className="text-danger">
          <strong>Errore:</strong> {error}
        </div>
      )}

      {/* Barra temporale */}
      {!error && minYear !== null && maxYear !== null && (
        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="timeline">
            Anno selezionato: {currentYear || "N/A"}
          </label>
          <input
            id="timeline"
            type="range"
            min={minYear}
            max={maxYear}
            value={currentYear || minYear}
            onChange={e => setCurrentYear(parseInt(e.target.value, 10))}
            style={{ width: "100%" }}
          />
        </div>
      )}

      {/* Mappa */}
      {!error && (
        <MapLeaflet height={height} center="43,13.32,10" baseLayers={baseLayers}>
          <VectorLayer
            name="Spostamenti"
            source={{
              ...source,
              transformData: () =>
                filteredData.map(item => ({
                  ...item,
                  coordinate: item.f_luoghi_id?.coordinate || null,
                })),
            }}
            popupTemplate="<strong>${f_luoghi_id.nome_localita}</strong>"
            icon={{
              type: "circleMarker",
              options: {
                color: "red",
                fillColor: "red",
                fillOpacity: 0.7,
                radius: 8,
              },
            }}
            checked={true}
            fitToContent={true}
          />
        </MapLeaflet>
      )}
    </div>
  );
};

TimeFilteredMap.propTypes = {
  height: PropTypes.string,
  baseLayers: PropTypes.arrayOf(PropTypes.string).isRequired,
  source: PropTypes.shape({
    dTable: PropTypes.string.isRequired,
    dEndPoint: PropTypes.string.isRequired,
    dToken: PropTypes.string.isRequired,
    dQueryString: PropTypes.string.isRequired,
  }).isRequired,
};

export default TimeFilteredMap;
