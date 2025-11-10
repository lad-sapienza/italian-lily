import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapLeaflet, VectorLayer } from "../../scms.js";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { Bar, Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import getDataFromSource from "../../../services/getDataFromSource";
import { Link } from "gatsby";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import L from "leaflet";
import { useMap, useMapEvents } from "react-leaflet";
import TutorialModal from "../../../usr/components/TutorialModal";

/* =========================
   Utils
   ========================= */
const pointInBounds = (lng, lat, bounds) => {
  if (!bounds) return true;
  const south = bounds.getSouth();
  const west = bounds.getWest();
  const north = bounds.getNorth();
  const east = bounds.getEast();
  return lat >= south && lat <= north && lng >= west && lng <= east;
};

// Endpoint Directus robusto
const getDirectusBase = () => {
  const env = (process.env.GATSBY_DIRECTUS_ENDPOINT || "").trim();
  if (env) return env.replace(/\/$/, "");
  if (typeof document !== "undefined") {
    const meta = document.querySelector('meta[name="directus-base"]');
    const m = meta?.getAttribute("content");
    if (m) return m.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.__DIRECTUS_BASE__) {
    return String(window.__DIRECTUS_BASE__).replace(/\/$/, "");
  }
  return null;
};

const ensureJSZip = async () => {
  if (typeof window !== "undefined" && window.JSZip) return window.JSZip;
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
    s.onload = () => resolve(window.JSZip);
    s.onerror = reject;
    document.head.appendChild(s);
  });
};


/* =========================
   Watcher bounds/zoom mappa
   ========================= */
const MapBoundsWatcher = ({ onChange }) => {
  const map = useMap();

  const emit = React.useMemo(() => {
    let raf = null;
    return () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        onChange(map.getBounds(), map.getZoom());
        raf = null;
      });
    };
  }, [map, onChange]);

  useEffect(() => {
    emit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMapEvents({
    moveend: emit,
    zoomend: emit,
  });

  return null;
};

/* =========================
   Modal di download
   ========================= */
const DownloadModal = ({
  show,
  onClose,
  totalCount,
  visibleCount,
  onDownload,
  downloading,
  defaultFormat = "csv",
  defaultScope = "visible",
}) => {
  const [format, setFormat] = useState(defaultFormat);
  const [scope, setScope] = useState(defaultScope);

  useEffect(() => {
    if (show) {
      setFormat(defaultFormat);
      setScope(defaultScope);
    }
  }, [show, defaultFormat, defaultScope]);

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Download dati</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div
          style={{
            background: "rgba(210,195,160,0.15)",
            border: "1px solid #d4c9a8",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            color: "#5a4a3a",
            fontFamily: "'Georgia', serif",
          }}
        >
          <div style={{ fontSize: 14, marginBottom: 6 }}>
            <strong>All movements:</strong> {totalCount ?? "…"}
          </div>
          <div style={{ fontSize: 14 }}>
            <strong>Filtered movements:</strong> {visibleCount}
          </div>
        </div>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Format</Form.Label>
            <div>
              <Form.Check inline type="radio" label="CSV" name="fmt" id="fmt-csv"
                checked={format === "csv"} onChange={() => setFormat("csv")} />
              <Form.Check inline type="radio" label="JSON" name="fmt" id="fmt-json"
                checked={format === "json"} onChange={() => setFormat("json")} />
              <Form.Check inline type="radio" label="GeoJSON" name="fmt" id="fmt-geojson"
                checked={format === "geojson"} onChange={() => setFormat("geojson")} />
            </div>
          </Form.Group>

          <Form.Group>
            <Form.Label>Ambito</Form.Label>
            <div>
              <Form.Check inline type="radio" label="All movements (current extent)"
                name="scope" id="scope-visible" checked={scope === "visible"}
                onChange={() => setScope("visible")} />
              <Form.Check inline type="radio" label="Data shown on map"
                name="scope" id="scope-all" checked={scope === "all"}
                onChange={() => setScope("all")} />
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>Annulla</Button>
        <Button variant="primary" style={{ backgroundColor: "#8B0000", border: "none" }}
          onClick={() => onDownload({ format, scope })} disabled={downloading}>
          {downloading ? (<><Spinner size="sm" animation="border" className="me-2" /> Preparazione…</>) : ("Scarica")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

/* =========================
   Componente principale
   ========================= */
export default function MapWithFilter() {
  const [yearRange, setYearRange] = useState([1500, 1600]);
  const [histogramData, setHistogramData] = useState({ years: [], counts: [] });
  const [cityData, setCityData] = useState({ labels: [], values: [] });
  const [filteredPersons, setFilteredPersons] = useState([]);
  const [rawFilteredData, setRawFilteredData] = useState([]);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  const [showDownload, setShowDownload] = useState(false);
  const [totalCount, setTotalCount] = useState(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const [mapBounds, setMapBounds] = useState(null);
  const mapContainerRef = useRef(null);

  const buildQuery = useCallback(() => {
    let query = `
      fields=f_luoghi_id.nome_localita,f_luoghi_id.coordinate,prima_attestazione_anno,ultima_attestazione_anno,f_persone_id.nome_e_cognome,ipotizzato,f_persone_id.id
      &limit=-1
    `.replace(/\s+/g, "");
    query += `&filter[prima_attestazione_anno][_lte]=${yearRange[1]}`;
    query += `&filter[prima_attestazione_anno][_gte]=${yearRange[0]}`;
    return query;
  }, [yearRange]);

  const getColorIntensity = (count) => {
    const intensity = Math.min(count / 10, 1);
    return `hsl(${(1 - intensity) * 240}, 80%, 70%)`;
  };

  const getClusterStyle = (pointCount) => {
    const baseRadius = 10;
    const maxRadius = 50;
    const radius = Math.min(baseRadius + Math.sqrt(pointCount) * 5, maxRadius);
    return {
      fillColor: getColorIntensity(pointCount),
      color: "#ffffff",
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.6,
      radius,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDataFromSource({
          dTable: "f_persone_f_luoghi",
          dEndPoint: process.env.GATSBY_DIRECTUS_ENDPOINT,
          dToken: process.env.GATSBY_DIRECTUS_TOKEN,
          dQueryString: buildQuery(),
        });

        const filtered = (data || []).filter(
          (item) =>
            item.prima_attestazione_anno >= yearRange[0] &&
            item.prima_attestazione_anno <= yearRange[1]
        );

        setRawFilteredData(filtered);

        const yearCounts = {};
        const cityCounts = {};
        filtered.forEach((item) => {
          const year = item.prima_attestazione_anno;
          const city = item.f_luoghi_id?.nome_localita;
          if (year) yearCounts[year] = (yearCounts[year] || 0) + 1;
          if (city) cityCounts[city] = (cityCounts[city] || 0) + 1;
        });

        const years = Array.from({ length: 101 }, (_, i) => 1500 + i);
        const counts = years.map((y) => yearCounts[y] || 0);

        setHistogramData({ years, counts });
        setCityData({ labels: Object.keys(cityCounts), values: Object.values(cityCounts) });

        setFilteredPersons(
          filtered.map((item) => ({
            name: item.f_persone_id?.nome_e_cognome,
            city: item.f_luoghi_id?.nome_localita,
            yearStart: item.prima_attestazione_anno,
            yearEnd: item.ultima_attestazione_anno,
            isHypothetical: item.ipotizzato,
            isNullEnd: !item.ultima_attestazione_anno,
            id: item.f_persone_id?.id,
            coord: item.f_luoghi_id?.coordinate?.coordinates || null,
          }))
        );
      } catch (error) {
        console.error("Errore nel recupero dati:", error);
      }
    };
    fetchData();
  }, [buildQuery, yearRange]);

  useEffect(() => {
    if (!mapBounds) return;
    const count = rawFilteredData.reduce((acc, item) => {
      const coords = item?.f_luoghi_id?.coordinate?.coordinates;
      if (!coords) return acc;
      const [lng, lat] = coords;
      return acc + (pointInBounds(lng, lat, mapBounds) ? 1 : 0);
    }, 0);
    setVisibleCount(count);
  }, [mapBounds, rawFilteredData]);

  const groupedPersons = filteredPersons.reduce((acc, person) => {
    const fullName = person.name ? person.name.split(" ").reverse().join(" ") : "Anonimo";
    if (!acc[fullName]) acc[fullName] = [];
    acc[fullName].push(person);
    return acc;
  }, {});

  const buildDownloadQuery = useCallback((range) => {
    const fields = [
      "f_persone_id.nome_e_cognome",
      "f_persone_id.Pseudonimo",
      "f_persone_id.cognome_naturalizzato_o_coniuge",
      "f_luoghi_id.nome_localita",
      "f_luoghi_id.toponimo_storico",
      "f_luoghi_id.coordinate",
      "prima_attestazione_data",
      "prima_attestazione_mese",
      "prima_attestazione_anno",
      "ultima_attestazione_data",
      "ultima_attestazione_mese",
      "ultima_attestazione_anno",
      "ipotizzato",
      "spostato_in_qualita_di",
      "residente",
      "fonte",
      "note_sullo_spostamento",
    ];
    let q = `fields=${encodeURIComponent(fields.join(","))}&limit=-1`;
    q += `&filter[prima_attestazione_anno][_lte]=${range[1]}`;
    q += `&filter[prima_attestazione_anno][_gte]=${range[0]}`;
    return q;
  }, []);

  const fetchTotalCount = useCallback(async () => {
    try {
      const base = getDirectusBase();
      if (!base) {
        console.warn("Directus endpoint non configurato (GATSBY_DIRECTUS_ENDPOINT).");
        setTotalCount(0);
        return;
      }
      const url = `${base}/items/f_persone_f_luoghi?limit=0&meta=total_count`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${process.env.GATSBY_DIRECTUS_TOKEN || ""}` },
      });
      const json = await res.json();
      const tot = json?.meta?.total_count ?? 0;
      setTotalCount(tot);
    } catch (e) {
      console.warn("Impossibile recuperare il total_count. Fallback 0.", e);
      setTotalCount(0);
    }
  }, []);

  const openDownload = () => {
    if (totalCount === null) fetchTotalCount();
    setShowDownload(true);
  };

  const handleDownload = async ({ format, scope }) => {
    try {
      setDownloading(true);

      const base = getDirectusBase();
      if (!base) {
        alert("Endpoint Directus non configurato. Imposta GATSBY_DIRECTUS_ENDPOINT.");
        setDownloading(false);
        return;
      }

      const query = buildDownloadQuery(yearRange);
      const url = `${base}/items/f_persone_f_luoghi?${query}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${process.env.GATSBY_DIRECTUS_TOKEN || ""}` },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Download HTTP error:", res.status, text);
        alert(`Errore HTTP ${res.status} durante il download.`);
        setDownloading(false);
        return;
      }

      const json = await res.json();
      let rows = json?.data || [];

      if (scope === "visible" && mapBounds) {
        rows = rows.filter((item) => {
          const coords = item?.f_luoghi_id?.coordinate?.coordinates;
          if (!coords) return false;
          const [lng, lat] = coords;
          return pointInBounds(lng, lat, mapBounds);
        });
      }

    const projected = projectRows(rows);

    const filenameBase = `movements_${yearRange[0]}-${yearRange[1]}_${scope}`;
    let datasetName, datasetBlob;

    if (format === "json") {
      datasetName = `${filenameBase}.json`;
      datasetBlob = new Blob([JSON.stringify(projected, null, 2)], { type: "application/json" });
    } else if (format === "csv") {
      datasetName = `${filenameBase}.csv`;
      const csv = toCSVFromProjected(projected);
      datasetBlob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    } else if (format === "geojson") {
      datasetName = `${filenameBase}.geojson`;
      const gj = toGeoJSONProjected(rows, projected);
      datasetBlob = new Blob([JSON.stringify(gj, null, 2)], { type: "application/geo+json" });
    }

      // Recupera il file di spiegazione dai contenuti statici
      let fieldsText = "";
      try {
        const resp = await fetch("data/fields_movements.txt");
        if (resp.ok) fieldsText = await resp.text();
      } catch (e) {
        console.warn("Impossibile leggere fields_movements.txt:", e);
      }

      // Crea uno ZIP con dataset + fields_movements.txt
      try {
        const JSZip = await ensureJSZip();
        const zip = new JSZip();
        zip.file(datasetName, datasetBlob);
        if (fieldsText) zip.file("data/fields_movements.txt", fieldsText);
        const zipBlob = await zip.generateAsync({ type: "blob" });
        triggerDownload(zipBlob, `${filenameBase}.zip`);
      } catch (zipErr) {
        // Fallback: scarica i due file separati
        console.warn("Zip non disponibile, eseguo doppio download.", zipErr);
        triggerDownload(datasetBlob, datasetName);
        if (fieldsText) {
          const fieldsBlob = new Blob([fieldsText], { type: "text/plain;charset=utf-8" });
          setTimeout(() => triggerDownload(fieldsBlob, "fields_movements.txt"), 400);
        }
      }

      setShowDownload(false);
    } catch (e) {
      console.error("Errore durante il download:", e);
      alert("Errore durante il download dei dati.");
    } finally {
      setDownloading(false);
    }
  };

// Mappa: path Directus -> chiave export (inglese)
const EXPORT_FIELD_MAP = [
  { path: "f_persone_id.nome_e_cognome",                   key: "person_full_name" },
  { path: "f_persone_id.Pseudonimo",                       key: "person_pseudonym" },
  { path: "f_persone_id.cognome_naturalizzato_o_coniuge",  key: "person_naturalized_or_spousal_surname" },

  { path: "f_luoghi_id.nome_localita",                     key: "place_name" },
  { path: "f_luoghi_id.toponimo_storico",                  key: "place_historic_toponym" },
  { path: "f_luoghi_id.coordinate",                        key: "coordinates" }, // [lng, lat]

  { path: "prima_attestazione_data",                       key: "earliest_attested_day" },
  { path: "prima_attestazione_mese",                       key: "earliest_attested_month" },
  { path: "prima_attestazione_anno",                       key: "earliest_attested_year" },

  { path: "ultima_attestazione_data",                      key: "latest_attested_day" },
  { path: "ultima_attestazione_mese",                      key: "latest_attested_month" },
  { path: "ultima_attestazione_anno",                      key: "latest_attested_year" },

  { path: "ipotizzato",                                    key: "hypothesized" },
  { path: "spostato_in_qualita_di",                        key: "role" },
  { path: "residente",                                     key: "resident" },
  { path: "fonte",                                         key: "source" },
  { path: "note_sullo_spostamento",                        key: "movement_notes" },
];

  const getByPath = (obj, path) =>
    path.split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), obj);

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

const projectRows = (rows) =>
  rows.map((r) => {
    const out = {};
    for (const { path, key } of EXPORT_FIELD_MAP) {
      let val = getByPath(r, path);
      if (key === "coordinates") {
        val = val?.coordinates || null; // mantieni [lng, lat] in JSON
      }
      out[key] = val ?? null;
    }
    return out;
  });

  // CSV: header = chiavi inglesi; coordinates -> "lng,lat"
  const toCSVFromProjected = (rows) => {
    const header = EXPORT_FIELD_MAP.map((f) => f.key).join(",");
    const data = rows.map((r) =>
      EXPORT_FIELD_MAP.map(({ key }) => {
        if (key === "coordinates") {
          const c = r.coordinates;
          return escapeCSV(c ? `${c[0]},${c[1]}` : "");
        }
        return escapeCSV(r[key]);
      }).join(",")
    );
    return [header, ...data].join("\n");
  };

  // GeoJSON: geometry da Directus, properties = proiezione inglese (senza coordinates)
  const toGeoJSONProjected = (origRows, projRows) => {
    const features = origRows
      .map((r, i) => {
        const coord = r?.f_luoghi_id?.coordinate;
        if (!coord?.coordinates) return null;
        const props = { ...projRows[i] };
        delete props.coordinates;
        return { type: "Feature", geometry: coord, properties: props };
      })
      .filter(Boolean);
    return { type: "FeatureCollection", features };
  };

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleBoundsChange = React.useCallback((b) => {
    setMapBounds((prev) => {
      if (!prev) return b;
      const sigPrev = [prev.getSouth(), prev.getWest(), prev.getNorth(), prev.getEast()]
        .map((n) => n.toFixed(5))
        .join("|");
      const sigCurr = [b.getSouth(), b.getWest(), b.getNorth(), b.getEast()]
        .map((n) => n.toFixed(5))
        .join("|");
      return sigPrev === sigCurr ? prev : b;
    });
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{
        display: "flex",
        height: "100vh",
        flexDirection: "row",
        position: "relative",
        backgroundColor: "#f5f2e9",
        fontFamily: "'Georgia', serif",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 120,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3000,
          cursor: "pointer",
          backgroundColor: "rgba(255,255,255,0.9)",
          borderRadius: "50%",
          width: "44px",
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #5a4a3a",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          transition: "all 0.3s ease",
        }}
        onClick={() => setShowHelp(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(210, 195, 160, 0.9)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)";
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5a4a3a" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>

      <TutorialModal show={showHelp} onClose={() => setShowHelp(false)} />

      <div style={{ flex: 1, position: "relative" }}>
        {/* Bottone Download: fisso, sopra la mappa */}
        <Button
          variant="light"
          onClick={openDownload}
          style={{
            position: "fixed",
            top: 120,
            left: 16,
            zIndex: 3000,
            backgroundColor: "rgba(245, 242, 233, 0.95)",
            border: "1px solid #d4c9a8",
            color: "#5a4a3a",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            display: "flex",
            gap: 8,
            alignItems: "center",
            pointerEvents: "auto",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5a4a3a" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </Button>

        <MapLeaflet
          height="100%"
          center="48.8566,2.3522,5"
          baseLayers={["CartoDb"]}
          style={{ filter: "sepia(0.3) brightness(0.9) contrast(1.1)", borderRight: "1px solid #d4c9a8" }}
        >
          <VectorLayer
            name="Spostamenti"
            source={{
              dTable: "f_persone_f_luoghi",
              dEndPoint: process.env.GATSBY_DIRECTUS_ENDPOINT,
              dToken: process.env.GATSBY_DIRECTUS_TOKEN,
              dQueryString: buildQuery(),
              geoField: "f_luoghi_id.coordinate",
            }}
            cluster={true}
            clusterOptions={{
              showCoverageOnHover: false,
              spiderfyOnMaxZoom: false,
              disableClusteringAtZoom: 12,
              maxClusterRadius: 40,
            }}
            pointToLayer={(feature, latlng) => L.circleMarker(latlng, getClusterStyle(1))}
            clusterToLayer={(cluster) => {
              const count = cluster.getChildCount();
              return L.circleMarker(cluster.getLatLng(), getClusterStyle(count));
            }}
          />

          <MapBoundsWatcher onChange={handleBoundsChange} />
        </MapLeaflet>

        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: isPanelCollapsed ? "50%" : "calc(50% - 175px)",
            transform: "translateX(-50%)",
            width: isPanelCollapsed ? "70%" : "calc(70% - 175px)",
            padding: "10px 15px",
            backgroundColor: "transparent",
            border: "none",
            zIndex: 1000,
            transition: "all 0.3s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
              color: "#5a4a3a",
              fontSize: "14px",
            }}
          >
            <span>1500</span>
            <span
              style={{
                fontWeight: "bold",
                backgroundColor: "rgba(139, 69, 19, 0.1)",
                padding: "2px 10px",
                borderRadius: "12px",
                border: "1px solid rgba(139, 69, 19, 0.3)",
              }}
            >
              {yearRange[0]} — {yearRange[1]}
            </span>
            <span>1600</span>
          </div>

          <Slider
            range min={1500} max={1600} step={1} value={yearRange}
            onChange={(value) => setYearRange(value)}
            trackStyle={[{ backgroundColor: "rgba(139, 69, 19, 0.7)", height: "4px" }]}
            handleStyle={[
              { border: "none", backgroundColor: "transparent", width: "0", height: "0", marginTop: "-10px",
                borderLeft: "10px solid #5a4a3a", borderTop: "7px solid transparent", borderBottom: "7px solid transparent",
                transform: "rotate(180deg)", cursor: "pointer" },
              { border: "none", backgroundColor: "transparent", width: "0", height: "0", marginTop: "-10px",
                borderRight: "10px solid #5a4a3a", borderTop: "7px solid transparent", borderBottom: "7px solid transparent",
                cursor: "pointer" }
            ]}
            railStyle={{ backgroundColor: "rgba(139, 69, 19, 0.2)", height: "4px" }}
          />

          <div style={{ width: "100%", height: "50px", marginTop: "8px" }}>
            <Bar
              data={{
                labels: histogramData.years,
                datasets: [{
                  data: histogramData.counts,
                  backgroundColor: histogramData.years.map((year) =>
                    year >= yearRange[0] && year <= yearRange[1]
                      ? "rgba(139, 69, 19, 0.6)"
                      : "rgba(139, 69, 19, 0.15)"
                  ),
                  borderWidth: 0, borderRadius: 2,
                }],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: { label: (ctx) => `${ctx.raw} spostamenti nel ${ctx.label}` },
                    displayColors: false, backgroundColor: "rgba(91, 74, 58, 0.9)",
                    titleFont: { family: "'Georgia', serif" }, bodyFont: { family: "'Georgia', serif" },
                  },
                },
                scales: { x: { display: false }, y: { display: false } },
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: "50%",
          right: isPanelCollapsed ? "20px" : "370px",
          transform: "translateY(-50%)",
          zIndex: 1001,
          transition: "right 0.3s ease",
        }}
      >
        <Button
          onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
          variant="light"
          style={{
            backgroundColor: "rgba(245, 242, 233, 0.9)",
            border: "1px solid #d4c9a8",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#5a4a3a",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "all 0.3s ease",
            backgroundImage:
              'url("data:images/svg+xml;utf8,<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 24 24\\" fill=\\"%235a4a3a\\"><path d=\\"M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z\\"/></svg>")',
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "24px",
          }}
        />
      </div>

      <div
        style={{
          width: isPanelCollapsed ? "0" : "350px",
          height: "100vh",
          position: "absolute",
          right: 0,
          top: 0,
          backgroundColor: "rgba(245, 242, 233, 0.95)",
          borderLeft: "1px solid #d4c9a8",
          boxShadow: "-2px 0 10px rgba(0,0,0,0.1)",
          overflow: "hidden",
          transition: "width 0.3s ease",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #d4c9a8",
            backgroundColor: "rgba(210, 195, 160, 0.3)",
          }}
        >
          <h2 style={{ margin: 0, color: "#5a4a3a", fontSize: "20px", fontWeight: "normal", fontStyle: "italic" }}>
            Movements
          </h2>
          <p style={{ margin: "5px 0 0", color: "#7a6b5a", fontSize: "14px" }}>
            {yearRange[0]} - {yearRange[1]}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "15px" }}>
          <div
            style={{
              margin: "0 auto 30px",
              width: "100%",
              height: "250px",
              position: "relative",
              border: "1px solid #d4c9a8",
              borderRadius: "12px",
              padding: "10px",
              backgroundColor: "transparent",
              backdropFilter: "blur(6px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            <Doughnut
              data={{
                labels: cityData.labels,
                datasets: [{
                  label: "Spostamenti per città",
                  data: cityData.values,
                  backgroundColor: ["#8b4513", "#a0522d", "#cd853f", "#deb887", "#f5deb3"],
                  borderColor: "#f5f2e9",
                  borderWidth: 2,
                }],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true, position: "bottom",
                    labels: { color: "#5a4a3a", font: { family: "'Georgia', serif", size: 13 } },
                  },
                },
                cutout: "60%",
              }}
            />
          </div>

          <div style={{ marginTop: "10px" }}>
            <h3 style={{ color: "#5a4a3a", borderBottom: "1px solid #d4c9a8", paddingBottom: "5px", fontSize: "16px", margin: "0 0 15px" }}>
              People ({filteredPersons.length})
            </h3>

            {Object.keys(groupedPersons).map((name, index) => (
              <div key={index}
                style={{ marginBottom: "15px", border: "1px solid #d4c9a8", borderRadius: "6px", overflow: "hidden", backgroundColor: "rgba(255,255,255,0.5)" }}>
                <Link to={`/record/?tb=f_persone&id=${groupedPersons[name][0].id}`}
                  style={{ textDecoration: "none", display: "block", padding: "10px",
                    backgroundColor: "rgba(139, 69, 19, 0.1)", borderBottom: "1px solid #d4c9a8",
                    color: "#5a4a3a", fontWeight: "bold", fontStyle: "italic" }}>
                  {name}
                </Link>
                <div style={{ padding: "5px 10px" }}>
                  {groupedPersons[name].map((person, idx) => (
                    <div key={idx}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "8px 0", borderBottom: idx !== groupedPersons[name].length - 1 ? "1px dashed #d4c9a8" : "none",
                        fontSize: "14px", color: "#5a4a3a",
                      }}>
                      <span>{person.city}</span>
                      <span
                        style={{
                          backgroundColor: person.isHypothetical ? "rgba(255,0,0,0.1)" : "rgba(0,128,0,0.1)",
                          padding: "2px 6px", borderRadius: "10px",
                          color: person.isHypothetical ? "#8b0000" : "#006400", fontSize: "12px",
                        }}
                      >
                        {person.yearStart} {person.isHypothetical ? "✘" : "✔"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DownloadModal
        show={showDownload}
        onClose={() => setShowDownload(false)}
        totalCount={totalCount}
        visibleCount={visibleCount}
        onDownload={handleDownload}
        downloading={downloading}
      />
    </div>
  );
}
