import React, { useState, useEffect } from "react";
import { MapLeaflet, VectorLayer } from "../../scms.js"; // Assicurati che il percorso sia corretto

export default function MapWithFilter() {
  const [filterYear, setFilterYear] = useState(null); // Imposta anno iniziale a null per mostrare tutti gli elementi di default
  const [isPlaying, setIsPlaying] = useState(false); // Controlla se autoplay è attivo

  // Costruisce la query dinamica
  const buildQuery = () => {
    let query = `
      fields=f_luoghi_id.nome_localita,f_luoghi_id.coordinate,prima_attestazione_anno,ultima_attestazione_anno,f_persone_id.nome_e_cognome,ipotizzato
      &limit=-1
    `.replace(/\s+/g, "");

    if (filterYear !== null) {
      query += `&filter[prima_attestazione_anno][_lte]=${filterYear}`;
      query += `&filter[ultima_attestazione_anno][_gte]=${filterYear}`;
    }

    return query;
  };

  // Autoplay: avanza automaticamente di un anno ogni 1 secondo
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setFilterYear((prevYear) => (prevYear === null || prevYear < 1600 ? (prevYear || 1500) + 1 : 1500)); // Ciclo tra 1500 e 1600
      }, 1000);
    }
    return () => clearInterval(interval); // Pulisce l'intervallo al termine
  }, [isPlaying]);

  return (
    <div>
      {/* Mappa */}
      <MapLeaflet
        height="500px"
        center="48.8566,2.3522,5" // Centra su Parigi, zoom più ampio
        baseLayers={["OSM"]}
      >
        <VectorLayer
          name="Spostamenti"
          source={{
            dTable: "f_persone_f_luoghi",
            dEndPoint: process.env.GATSBY_DIRECTUS_API_URL,
            dToken: process.env.GATSBY_DIRECTUS_API_TOKEN,
            dQueryString: buildQuery(), // Usa la query dinamica
            geoField: "f_luoghi_id.coordinate",
          }}
          transformData={(data) => {
            console.log("Transforming data for color assignment");
            return data.map((feature) => {
              const isIpotizzato = feature.properties.ipotizzato;
              feature.properties.icon = isIpotizzato ? "triangle" : "circle"; // Tipo di icona
              feature.properties.color = isIpotizzato ? "red" : "green"; // Colore
              console.log(`Feature icon: ${feature.properties.icon}, color: ${feature.properties.color}, ipotizzato: ${isIpotizzato}`);
              return feature;
            });
          }}
          popupTemplate={(feature) => {
            const localita = feature.properties.f_luoghi_id.nome_localita;
            const personeId = Array.isArray(feature.properties.f_persone_id)
              ? feature.properties.f_persone_id
              : [feature.properties.f_persone_id];

            const nomiPersone = personeId
              .map((persona) => persona?.nome_e_cognome)
              .filter(Boolean)
              .join(", ");

            return `
              <strong>${localita}</strong><br />
              Persone attestate: ${personeId.length}<br />
              Nomi: ${nomiPersone || "Nessuna informazione"}
            `;
          }}
          icon={{
            type: "{icon}", // Usa il tipo di icona calcolato
            options: {
              color: "{color}", // Usa il colore calcolato
              fillColor: "{color}",
              fillOpacity: 0.6,
              radius: 8,
            },
          }}
          cluster={false} // Disabilita il clustering per verificare il colore dei marker
        />
      </MapLeaflet>

      {/* Barra del tempo */}
      <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: "10px 20px",
            backgroundColor: isPlaying ? "red" : "green",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {isPlaying ? "Stop" : "Play"}
        </button>
        <button
          onClick={() => setFilterYear(null)} // Resetta il filtro per mostrare tutti gli elementi
          style={{
            padding: "10px 20px",
            backgroundColor: "blue",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          See All
        </button>
        <label style={{ flex: 1, fontSize: "16px" }}>
          <span>Anno: {filterYear !== null ? filterYear : "Tutti"}</span>
          <input
            type="range"
            min="1500"
            max="1600"
            step="1"
            value={filterYear !== null ? filterYear : 1500}
            onChange={(e) => setFilterYear(parseInt(e.target.value, 10))}
            style={{
              width: "100%",
              marginLeft: "10px",
              accentColor: "#007bff",
              cursor: "pointer",
            }}
          />
        </label>
      </div>
    </div>
  );
}
