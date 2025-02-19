import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const ArrowMapWithTimeBar = ({ height, baseLayers, markers }) => {
  const [currentYear, setCurrentYear] = useState(
    Math.min(...markers.map(marker => marker.prima_attestazione_anno || Infinity))
  );

  // Raggruppa i marker per luogo
  const groupedMarkers = markers.reduce((acc, marker) => {
    const existingMarker = acc.find(m => m.lat === marker.lat && m.lng === marker.lng);

    const spostamento = {
      prima: marker.prima_attestazione_anno,
      ultima: marker.ultima_attestazione_anno,
      residente: marker.residente,
      spostato_in_qualita_di: marker.spostato_in_qualita_di,
      note_sullo_spostamento: marker.note_sullo_spostamento,
      fonte: marker.fonte,
    };

    if (existingMarker) {
      existingMarker.spostamenti.push(spostamento);
    } else {
      acc.push({
        ...marker,
        spostamenti: [spostamento],
      });
    }

    return acc;
  }, []);

  // Filtra i marker in base all'anno corrente
  const filteredMarkers = groupedMarkers.filter(marker =>
    marker.spostamenti.some(spostamento => spostamento.prima <= currentYear)
  );

  // Trova il marker più recente
  const mostRecentMarker = filteredMarkers.reduce((latest, marker) => {
    const latestYear = Math.max(...(latest?.spostamenti || []).map(s => s.prima || -Infinity));
    const markerYear = Math.max(...marker.spostamenti.map(s => s.prima || -Infinity));
    return markerYear > latestYear ? marker : latest;
  }, null);

  // Genera icone Leaflet dinamiche con etichette personalizzate
  const generateIcon = (spostamenti, isMostRecent) => {
    const years = spostamenti.map(spostamento => {
      const prima = spostamento.prima || "?";
      const ultima = spostamento.ultima || "?";
      return `${prima}-${ultima}`;
    });

    const backgroundColor = isMostRecent ? "#d4edda" : "white"; // Verde chiaro per il più recente

    const iconHtml = `
      <div style="position: relative; text-align: center; background-color: ${backgroundColor}; border: 1px solid black; border-radius: 5px; padding: 2px; font-size: 12px;">
        ${years.join("<br>")}
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: "custom-div-icon", // Classe per eventuale styling aggiuntivo
      iconSize: [100, 40], // Dimensioni dell'icona
      iconAnchor: [50, 20],
      popupAnchor: [0, -20],
    });
  };

  // Prepara le linee e frecce con direzione corretta
  const arrowLines = [];
  const sortedMarkers = [...filteredMarkers].sort((a, b) =>
    Math.min(...a.spostamenti.map(s => s.prima)) - Math.min(...b.spostamenti.map(s => s.prima))
  );

  for (let i = 0; i < sortedMarkers.length - 1; i++) {
    const from = sortedMarkers[i];
    const to = sortedMarkers[i + 1];

    // Assicurati che il marker successivo abbia una data successiva
    const fromDate = Math.min(...from.spostamenti.map(s => s.prima));
    const toDate = Math.min(...to.spostamenti.map(s => s.prima));
    if (fromDate > toDate) continue; // Evita frecce che puntano verso date più vecchie

    // Calcolo della posizione della cuspide
    const dx = to.lat - from.lat;
    const dy = to.lng - from.lng;
    const length = Math.sqrt(dx * dx + dy * dy);
    const unitDx = dx / length;
    const unitDy = dy / length;

    // Posizione della freccia (vicino al marker di destinazione)
    const arrowBaseLat = to.lat - unitDx * 0.2; // Adjust length of the arrow shaft
    const arrowBaseLng = to.lng - unitDy * 0.2;

    // Posizioni per la cuspide
    const arrowLeftLat = arrowBaseLat - unitDy * 0.05; // Adjust width of arrowhead
    const arrowLeftLng = arrowBaseLng + unitDx * 0.05;
    const arrowRightLat = arrowBaseLat + unitDy * 0.05;
    const arrowRightLng = arrowBaseLng - unitDx * 0.05;

    arrowLines.push({
      positions: [
        [from.lat, from.lng], // Linea
        [arrowBaseLat, arrowBaseLng], // Base della cuspide
      ],
      arrowHead: [
        [arrowLeftLat, arrowLeftLng], // Punta sinistra
        [to.lat, to.lng], // Punta centrale (direzione)
        [arrowRightLat, arrowRightLng], // Punta destra
      ],
    });
  }

  return (
    <div>
      <MapContainer style={{ height }} center={[45, 4]} zoom={5}>
        {/* Base layers */}
        {baseLayers.map((layer, index) => (
          <TileLayer key={index} attribution="" url={`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`} />
        ))}

        {/* Markers e popup */}
        {filteredMarkers.map((marker, index) => {
          const spostamentiFiltrati = marker.spostamenti.filter(
            spostamento => spostamento.prima <= currentYear
          );

          const isMostRecent = marker === mostRecentMarker;

          const popupContent = spostamentiFiltrati.map((spostamento, idx) => (
            <div key={idx} style={{ borderBottom: "1px solid #ddd", marginBottom: "8px", paddingBottom: "8px" }}>
              <strong>Spostato in qualità di:</strong> {spostamento.spostato_in_qualita_di || "N/A"}
              <br />
              <strong>Periodo:</strong> {spostamento.prima || "?"} - {spostamento.ultima || "?"}
              <br />
              <strong>Residente:</strong> {spostamento.residente ? "Sì" : "No"}
              <br />
              {spostamento.note_sullo_spostamento && (
                <div>
                  <strong>Note:</strong>
                  <div dangerouslySetInnerHTML={{ __html: spostamento.note_sullo_spostamento }} />
                </div>
              )}
              {spostamento.fonte && (
                <div>
                  <strong>Fonte:</strong> {spostamento.fonte}
                </div>
              )}
            </div>
          ));

          return (
            <Marker
              key={index}
              position={[marker.lat, marker.lng]}
              icon={generateIcon(spostamentiFiltrati, isMostRecent)}
            >
              <Popup>
                <div style={{ maxWidth: "300px" }}>
                  <h4>{marker.popup || "Luogo sconosciuto"}</h4>
                  {popupContent}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Linee e frecce */}
        {arrowLines.map((line, index) => (
          <React.Fragment key={index}>
            {/* Linea principale tratteggiata */}
            <Polyline
              positions={line.positions}
              pathOptions={{
                color: "blue",
                weight: 4,
                opacity: 0.7,
                dashArray: "10, 5", // Linea tratteggiata
              }}
            />
            {/* Cuspide */}
            <Polyline
              positions={line.arrowHead}
              pathOptions={{
                color: "blue",
                weight: 4,
                fill: true,
                fillOpacity: 1,
              }}
            />
          </React.Fragment>
        ))}
      </MapContainer>

      {/* Barra temporale */}
      <div style={{ marginTop: "10px" }}>
        <label htmlFor="timeline">Anno: {currentYear}</label>
        <input
          id="timeline"
          type="range"
          min={Math.min(...markers.map(marker => marker.prima_attestazione_anno || Infinity))}
          max={Math.max(...markers.map(marker => marker.prima_attestazione_anno || -Infinity))}
          value={currentYear}
          onChange={e => setCurrentYear(parseInt(e.target.value, 10))}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
};

export default ArrowMapWithTimeBar;
