import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MapLeaflet } from "../../scms.js";
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

// ✅ markercluster (serve ora che non usiamo VectorLayer)
import "leaflet.markercluster/dist/leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

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
   Switch custom (sidebar extent)
   ========================= */
const ExtentSwitch = ({ checked, onChange, label = "Filter sidebar by extent" }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <span style={{ color: "#5a4a3a", fontSize: 13 }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        style={{
          width: 46,
          height: 24,
          borderRadius: 999,
          border: "1px solid #d4c9a8",
          backgroundColor: checked ? "rgba(0,100,0,0.18)" : "rgba(90,74,58,0.12)",
          position: "relative",
          padding: 0,
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          flex: "0 0 auto",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 24 : 2,
            width: 18,
            height: 18,
            borderRadius: "50%",
            backgroundColor: checked ? "#006400" : "#5a4a3a",
            transition: "left 180ms ease",
          }}
        />
      </button>
    </div>
  );
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
   Modal download
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
   Modal dettagli luogo/cluster
   ========================= */
const PlaceClusterModal = ({ show, onClose, places = [] }) => {
  const isMulti = places.length > 1;

  const yearsChip = (label) => (
    <span
      key={label}
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 12,
        margin: "2px 6px 2px 0",
        background: "rgba(139, 69, 19, 0.10)",
        border: "1px solid rgba(139, 69, 19, 0.20)",
        color: "#5a4a3a",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );

  const renderPlace = (p) => {
    return (
      <div
        style={{
          border: "1px solid #d4c9a8",
          borderRadius: 10,
          padding: 12,
          background: "rgba(255,255,255,0.55)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 18, color: "#5a4a3a", fontStyle: "italic" }}>{p.placeName}</div>
            <div style={{ color: "#7a6b5a", fontSize: 13, marginTop: 2 }}>
              Total movements: <strong>{p.totalMovements}</strong> — People: <strong>{p.peopleCount}</strong>
            </div>
          </div>
          <div style={{ color: "#7a6b5a", fontSize: 12, textAlign: "right" }}>
            {p.yearLabels?.length ? (
              <>
                <div><strong>Years</strong></div>
                <div style={{ marginTop: 4 }}>
                  {p.yearLabels.slice(0, 12).map((y) => yearsChip(y))}
                  {p.yearLabels.length > 12 ? <span style={{ fontSize: 12, color: "#7a6b5a" }}>…</span> : null}
                </div>
              </>
            ) : (
              <span>Years: —</span>
            )}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {p.persons.map((per) => (
            <div
              key={per.key}
              style={{
                borderTop: "1px dashed #d4c9a8",
                paddingTop: 10,
                marginTop: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <Link
                  to={per.id != null ? `/record/?tb=f_persone&id=${per.id}` : "#"}
                  style={{
                    textDecoration: "none",
                    color: "#5a4a3a",
                    fontWeight: "bold",
                    fontStyle: "italic",
                    pointerEvents: per.id != null ? "auto" : "none",
                    opacity: per.id != null ? 1 : 0.7,
                  }}
                >
                  {per.name}
                </Link>
                <span
                  style={{
                    backgroundColor: "rgba(0,128,0,0.10)",
                    border: "1px solid rgba(0,128,0,0.18)",
                    color: "#006400",
                    padding: "2px 8px",
                    borderRadius: 999,
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  {per.count} movements
                </span>
              </div>

              {per.yearLabels?.length ? (
                <div style={{ marginTop: 6 }}>
                  {per.yearLabels.slice(0, 18).map((y) => yearsChip(y))}
                  {per.yearLabels.length > 18 ? <span style={{ fontSize: 12, color: "#7a6b5a" }}>…</span> : null}
                </div>
              ) : (
                <div style={{ marginTop: 6, fontSize: 12, color: "#7a6b5a" }}>Years: —</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          {isMulti ? `Cluster details (${places.length} places)` : (places[0]?.placeName || "Details")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ background: "#f5f2e9" }}>
        {places.length === 0 ? (
          <div style={{ color: "#7a6b5a" }}>Nessun dato disponibile per questo cluster.</div>
        ) : isMulti ? (
          <div style={{ display: "grid", gap: 12 }}>
            {places.map((p) => (
              <details key={p.placeName} open style={{ borderRadius: 10 }}>
                <summary
                  style={{
                    cursor: "pointer",
                    padding: "8px 10px",
                    border: "1px solid #d4c9a8",
                    borderRadius: 10,
                    background: "rgba(210,195,160,0.20)",
                    color: "#5a4a3a",
                    fontStyle: "italic",
                  }}
                >
                  {p.placeName} — {p.totalMovements} movements
                </summary>
                <div style={{ marginTop: 10 }}>{renderPlace(p)}</div>
              </details>
            ))}
          </div>
        ) : (
          renderPlace(places[0])
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>Chiudi</Button>
      </Modal.Footer>
    </Modal>
  );
};

/* =========================
   Layer cluster custom (solo in questo file)
   ========================= */
const MovementsClusterLayer = ({ rows, getMarkerStyle, getClusterIcon, onOpenPlaces }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (!rows || rows.length === 0) return;
    if (!L.markerClusterGroup) return;

    const group = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,

      // ✅ disattiva comportamento default
      zoomToBoundsOnClick: false,
      spiderfyOnMaxZoom: false,
      spiderfyOnEveryZoom: false,

      maxClusterRadius: 40,
      iconCreateFunction: getClusterIcon,
    });

    // click sul cluster => modal
    group.on("clusterclick", (e) => {
      try {
        if (e?.originalEvent) {
          e.originalEvent.preventDefault();
          e.originalEvent.stopPropagation();
        }
        const markers = e.layer?.getAllChildMarkers?.() || [];
        const placeNames = Array.from(
          new Set(markers.map((m) => m?.options?.__placeName).filter(Boolean))
        );
        if (placeNames.length) onOpenPlaces(placeNames);
      } catch (err) {
        console.warn("Cluster click error:", err);
      }
    });

    // marker singolo => modal (stesso comportamento)
    rows.forEach((r) => {
      const placeName = r?.f_luoghi_id?.nome_localita || "Unknown place";
      const coords = r?.f_luoghi_id?.coordinate?.coordinates;
      if (!coords) return;
      const [lng, lat] = coords;

      const marker = L.circleMarker([lat, lng], getMarkerStyle(placeName));
      marker.options.__placeName = placeName;

      marker.on("click", (ev) => {
        if (ev?.originalEvent) {
          ev.originalEvent.preventDefault?.();
          ev.originalEvent.stopPropagation?.();
        }
        onOpenPlaces([placeName]);
      });

      group.addLayer(marker);
    });

    map.addLayer(group);

    return () => {
      try {
        map.removeLayer(group);
      } catch {
        // ignore
      }
    };
  }, [map, rows, getMarkerStyle, getClusterIcon, onOpenPlaces]);

  return null;
};

/* =========================
   Componente principale
   ========================= */
export default function MapWithFilter() {
  const [yearRange, setYearRange] = useState([1500, 1600]);
  const [histogramData, setHistogramData] = useState({ years: [], counts: [] });

  // dati grezzi per mappa+modal (uno per movement)
  const [rawFilteredData, setRawFilteredData] = useState([]);

  // sidebar
  const [filteredPersons, setFilteredPersons] = useState([]);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [sidebarFollowsExtent, setSidebarFollowsExtent] = useState(true);

  // download
  const [showDownload, setShowDownload] = useState(false);
  const [totalCount, setTotalCount] = useState(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [downloading, setDownloading] = useState(false);

  // bounds
  const [mapBounds, setMapBounds] = useState(null);
  const mapContainerRef = useRef(null);

  // modal cluster
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [placeModalData, setPlaceModalData] = useState([]);

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
      fillOpacity: 0.4,
      radius,
    };
  };

  // === fetch dati (unica fetch per mappa + sidebar + modal) ===
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

        // histogram
        const yearCounts = {};
        filtered.forEach((item) => {
          const year = item.prima_attestazione_anno;
          if (year) yearCounts[year] = (yearCounts[year] || 0) + 1;
        });
        const years = Array.from({ length: 101 }, (_, i) => 1500 + i);
        const counts = years.map((y) => yearCounts[y] || 0);
        setHistogramData({ years, counts });

        // sidebar persons list
        setFilteredPersons(
          filtered.map((item) => ({
            name: item.f_persone_id?.nome_e_cognome,
            city: item.f_luoghi_id?.nome_localita,
            yearStart: item.prima_attestazione_anno,
            yearEnd: item.ultima_attestazione_anno,
            isHypothetical: item.ipotizzato,
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

  // === conteggio movimenti nel viewport ===
  useEffect(() => {
    const count = rawFilteredData.reduce((acc, item) => {
      const coords = item?.f_luoghi_id?.coordinate?.coordinates;
      if (!coords) return acc;
      const [lng, lat] = coords;
      if (!mapBounds) return acc + 1;
      return acc + (pointInBounds(lng, lat, mapBounds) ? 1 : 0);
    }, 0);
    setVisibleCount(count);
  }, [mapBounds, rawFilteredData]);

  // === sidebar dataset: extent ON/OFF ===
  const sidebarMovements = useMemo(() => {
    const base = filteredPersons.filter((p) => !!p.coord);
    if (!sidebarFollowsExtent) return base;
    if (!mapBounds) return base;
    return base.filter((p) => pointInBounds(p.coord[0], p.coord[1], mapBounds));
  }, [filteredPersons, mapBounds, sidebarFollowsExtent]);

  const groupedPersons = useMemo(() => {
    return sidebarMovements.reduce((acc, person) => {
      const fullName = person.name ? person.name.split(" ").reverse().join(" ") : "Anonimo";
      if (!acc[fullName]) acc[fullName] = [];
      acc[fullName].push(person);
      return acc;
    }, {});
  }, [sidebarMovements]);

  const groupedPersonEntries = useMemo(() => {
    return Object.entries(groupedPersons).sort((a, b) => a[0].localeCompare(b[0]));
  }, [groupedPersons]);

  const cityDataForSidebar = useMemo(() => {
    const cityCounts = {};
    sidebarMovements.forEach((m) => {
      const city = m.city;
      if (city) cityCounts[city] = (cityCounts[city] || 0) + 1;
    });
    const entries = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);
    return {
      labels: entries.map(([k]) => k),
      values: entries.map(([, v]) => v),
    };
  }, [sidebarMovements]);

  // === indice per modal: place -> persons -> years ===
  const placeIndex = useMemo(() => {
    const idx = {};

    const addYearLabel = (obj, label, startYear) => {
      if (!label) return;
      obj._years = obj._years || new Map();
      const key = `${startYear ?? 999999}:${label}`;
      if (!obj._years.has(key)) obj._years.set(key, label);
    };

    rawFilteredData.forEach((r) => {
      const placeName = r?.f_luoghi_id?.nome_localita || "Unknown place";
      if (!idx[placeName]) {
        idx[placeName] = {
          placeName,
          totalMovements: 0,
          personsMap: {},
          _years: new Map(),
        };
      }

      idx[placeName].totalMovements += 1;

      const y0 = r?.prima_attestazione_anno ?? null;
      const y1 = r?.ultima_attestazione_anno ?? null;
      const label = y0 && y1 && y1 !== y0 ? `${y0}–${y1}` : (y0 ? String(y0) : (y1 ? String(y1) : null));
      addYearLabel(idx[placeName], label, y0 ?? y1);

      const pid = r?.f_persone_id?.id ?? null;
      const pname = r?.f_persone_id?.nome_e_cognome || "Anonimo";
      const pkey = pid != null ? String(pid) : `name:${pname}`;

      if (!idx[placeName].personsMap[pkey]) {
        idx[placeName].personsMap[pkey] = {
          key: pkey,
          id: pid,
          name: pname,
          count: 0,
          _years: new Map(),
        };
      }
      idx[placeName].personsMap[pkey].count += 1;
      addYearLabel(idx[placeName].personsMap[pkey], label, y0 ?? y1);
    });

    // finalize
    Object.values(idx).forEach((p) => {
      p.yearLabels = Array.from(p._years.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([, v]) => v);

      p.persons = Object.values(p.personsMap)
        .map((per) => ({
          ...per,
          yearLabels: Array.from(per._years.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([, v]) => v),
        }))
        .sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name));

      p.peopleCount = p.persons.length;

      delete p._years;
      delete p.personsMap;
    });

    return idx;
  }, [rawFilteredData]);

  const openPlacesModal = useCallback((placeNames) => {
    const uniq = Array.from(new Set(placeNames || [])).filter(Boolean);
    const data = uniq
      .map((n) => placeIndex[n])
      .filter(Boolean)
      .sort((a, b) => b.totalMovements - a.totalMovements);
    setPlaceModalData(data);
    setShowPlaceModal(true);
  }, [placeIndex]);

  // === stile markers (per luogo) ===
  const placeCounts = useMemo(() => {
    const counts = {};
    rawFilteredData.forEach((r) => {
      const p = r?.f_luoghi_id?.nome_localita;
      if (!p) return;
      counts[p] = (counts[p] || 0) + 1;
    });
    return counts;
  }, [rawFilteredData]);

  const getMarkerStyle = useCallback((placeName) => {
    const c = placeCounts[placeName] || 1;
    const st = getClusterStyle(c);
    return {
      ...st,
      radius: Math.min(12, 6 + Math.sqrt(c) * 1.6),
    };
  }, [placeCounts]);

  const getClusterIcon = useCallback((cluster) => {
    const count = cluster.getChildCount();
    const st = getClusterStyle(count);
    const size = Math.max(26, Math.min(64, 20 + Math.sqrt(count) * 10));

    // st.fillColor è "hsl(...)" -> lo convertiamo a "hsla(..., alpha)"
    const hsla = (alpha) =>
      String(st.fillColor)
        .replace(/^hsl\(/, "hsla(")
        .replace(/\)\s*$/, `, ${alpha})`);

    return L.divIcon({
      html: `<div style="
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        border:2px solid rgba(255,255,255,0.95);
        font-weight:bold;
        color:white;

        /* ✅ come prima, ma con trasparenza ~60% sul colore */
        background: radial-gradient(circle at 50% 45%,
          ${hsla(0.60)} 0%,
          ${hsla(0.60)} 55%,
          rgba(0,0,0,0.18) 100%
        );

        box-shadow:0 4px 14px rgba(0,0,0,0.18);
      ">${count}</div>`,
      className: "marker-cluster-custom",
      iconSize: [size, size],
    });
  }, [getClusterStyle]);

  // === download helpers ===
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

  const EXPORT_FIELD_MAP = [
    { path: "f_persone_id.nome_e_cognome", key: "person_full_name" },
    { path: "f_persone_id.Pseudonimo", key: "person_pseudonym" },
    { path: "f_persone_id.cognome_naturalizzato_o_coniuge", key: "person_naturalized_or_spousal_surname" },
    { path: "f_luoghi_id.nome_localita", key: "place_name" },
    { path: "f_luoghi_id.toponimo_storico", key: "place_historic_toponym" },
    { path: "f_luoghi_id.coordinate", key: "coordinates" },
    { path: "prima_attestazione_data", key: "earliest_attested_day" },
    { path: "prima_attestazione_mese", key: "earliest_attested_month" },
    { path: "prima_attestazione_anno", key: "earliest_attested_year" },
    { path: "ultima_attestazione_data", key: "latest_attested_day" },
    { path: "ultima_attestazione_mese", key: "latest_attested_month" },
    { path: "ultima_attestazione_anno", key: "latest_attested_year" },
    { path: "ipotizzato", key: "hypothesized" },
    { path: "spostato_in_qualita_di", key: "role" },
    { path: "residente", key: "resident" },
    { path: "fonte", key: "source" },
    { path: "note_sullo_spostamento", key: "movement_notes" },
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
        if (key === "coordinates") val = val?.coordinates || null;
        out[key] = val ?? null;
      }
      return out;
    });

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

      let fieldsText = "";
      try {
        const resp = await fetch("data/fields_movements.txt");
        if (resp.ok) fieldsText = await resp.text();
      } catch (e) {
        console.warn("Impossibile leggere fields_movements.txt:", e);
      }

      try {
        const JSZip = await ensureJSZip();
        const zip = new JSZip();
        zip.file(datasetName, datasetBlob);
        if (fieldsText) zip.file("data/fields_movements.txt", fieldsText);
        const zipBlob = await zip.generateAsync({ type: "blob" });
        triggerDownload(zipBlob, `${filenameBase}.zip`);
      } catch (zipErr) {
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

  const doughnutBaseColors = ["#8b4513", "#a0522d", "#cd853f", "#deb887", "#f5deb3"];
  const doughnutColors = cityDataForSidebar.labels.map((_, i) => doughnutBaseColors[i % doughnutBaseColors.length]);
  const peopleShownCount = groupedPersonEntries.length;

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
      {/* HELP */}
      <div
        style={{
          position: "fixed",
          top: 120,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1030,
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

      {/* MAP */}
      <div style={{ flex: 1, position: "relative" }}>
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
          {/* ✅ NUOVO layer cluster custom */}
          <MovementsClusterLayer
            rows={rawFilteredData}
            getMarkerStyle={getMarkerStyle}
            getClusterIcon={getClusterIcon}
            onOpenPlaces={openPlacesModal}
          />

          <MapBoundsWatcher onChange={handleBoundsChange} />
        </MapLeaflet>

        {/* TIMEBAR */}
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
            range
            min={1500}
            max={1600}
            step={1}
            value={yearRange}
            onChange={(value) => setYearRange(value)}
            trackStyle={[{ backgroundColor: "rgba(139, 69, 19, 0.7)", height: "4px" }]}
            handleStyle={[
              {
                border: "none",
                backgroundColor: "transparent",
                width: "0",
                height: "0",
                marginTop: "-10px",
                borderLeft: "10px solid #5a4a3a",
                borderTop: "7px solid transparent",
                borderBottom: "7px solid transparent",
                transform: "rotate(180deg)",
                cursor: "pointer",
              },
              {
                border: "none",
                backgroundColor: "transparent",
                width: "0",
                height: "0",
                marginTop: "-10px",
                borderRight: "10px solid #5a4a3a",
                borderTop: "7px solid transparent",
                borderBottom: "7px solid transparent",
                cursor: "pointer",
              },
            ]}
            railStyle={{ backgroundColor: "rgba(139, 69, 19, 0.2)", height: "4px" }}
          />

          <div style={{ width: "100%", height: "50px", marginTop: "8px" }}>
            <Bar
              data={{
                labels: histogramData.years,
                datasets: [
                  {
                    data: histogramData.counts,
                    backgroundColor: histogramData.years.map((year) =>
                      year >= yearRange[0] && year <= yearRange[1]
                        ? "rgba(139, 69, 19, 0.6)"
                        : "rgba(139, 69, 19, 0.15)"
                    ),
                    borderWidth: 0,
                    borderRadius: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: { label: (ctx) => `${ctx.raw} spostamenti nel ${ctx.label}` },
                    displayColors: false,
                    backgroundColor: "rgba(91, 74, 58, 0.9)",
                    titleFont: { family: "'Georgia', serif" },
                    bodyFont: { family: "'Georgia', serif" },
                  },
                },
                scales: { x: { display: false }, y: { display: false } },
              }}
            />
          </div>
        </div>
      </div>

      {/* TOGGLE SIDEBAR */}
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
          backgroundColor: "rgba(245, 242, 233, 0.95)", // pergamena
          border: "2px solid #5a4a3a",                  // bordo evidente
          borderRadius: "50%",
          width: "52px",
          height: "52px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#5a4a3a",
          boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
          transition: "all 0.2s ease",
          padding: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0px)")}
      >
        <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="#5a4a3a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {isPanelCollapsed ? (
            // chevron-left (apri)
            <path d="M10.5 2.5 L5.5 8 L10.5 13.5" />
          ) : (
            // chevron-right (chiudi)
            <path d="M5.5 2.5 L10.5 8 L5.5 13.5" />
          )}
        </svg>
      </Button>
      </div>

      {/* SIDEBAR */}
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
          {/* SWITCH STICKY */}
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              margin: "-15px -15px 15px -15px",
              padding: "10px 12px",
              backgroundColor: "rgba(245, 242, 233, 0.98)",
              borderBottom: "1px solid #d4c9a8",
              boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
            }}
          >
            <ExtentSwitch checked={sidebarFollowsExtent} onChange={setSidebarFollowsExtent} />
            <div style={{ marginTop: 6, fontSize: 12, color: "#7a6b5a" }}>
              {sidebarFollowsExtent ? `In view: ${visibleCount}` : `Showing all (ignoring extent) — In view: ${visibleCount}`}
            </div>
          </div>

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
                labels: cityDataForSidebar.labels,
                datasets: [
                  {
                    label: "Spostamenti per città",
                    data: cityDataForSidebar.values,
                    backgroundColor: doughnutColors,
                    borderColor: "#f5f2e9",
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: "bottom",
                    labels: { color: "#5a4a3a", font: { family: "'Georgia', serif", size: 13 } },
                  },
                },
                cutout: "60%",
              }}
            />
          </div>

          <div style={{ marginTop: "10px" }}>
            <h3
              style={{
                color: "#5a4a3a",
                borderBottom: "1px solid #d4c9a8",
                paddingBottom: "5px",
                fontSize: "16px",
                margin: "0 0 15px",
              }}
            >
              People ({peopleShownCount})
            </h3>

            {groupedPersonEntries.length === 0 ? (
              <div
                style={{
                  padding: "12px",
                  border: "1px dashed #d4c9a8",
                  borderRadius: "8px",
                  color: "#7a6b5a",
                  backgroundColor: "rgba(255,255,255,0.35)",
                  fontSize: 14,
                }}
              >
                Nessuno spostamento nell’area attualmente inquadrata.
              </div>
            ) : (
              groupedPersonEntries.map(([name, movements], index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "15px",
                    border: "1px solid #d4c9a8",
                    borderRadius: "6px",
                    overflow: "hidden",
                    backgroundColor: "rgba(255,255,255,0.5)",
                  }}
                >
                  <Link
                    to={`/record/?tb=f_persone&id=${movements[0].id}`}
                    style={{
                      textDecoration: "none",
                      display: "block",
                      padding: "10px",
                      backgroundColor: "rgba(139, 69, 19, 0.1)",
                      borderBottom: "1px solid #d4c9a8",
                      color: "#5a4a3a",
                      fontWeight: "bold",
                      fontStyle: "italic",
                    }}
                  >
                    {name}
                  </Link>
                  <div style={{ padding: "5px 10px" }}>
                    {movements.map((person, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 0",
                          borderBottom: idx !== movements.length - 1 ? "1px dashed #d4c9a8" : "none",
                          fontSize: "14px",
                          color: "#5a4a3a",
                        }}
                      >
                        <span>{person.city}</span>
                        <span
                          style={{
                            backgroundColor: person.isHypothetical ? "rgba(255,0,0,0.1)" : "rgba(0,128,0,0.1)",
                            padding: "2px 6px",
                            borderRadius: "10px",
                            color: person.isHypothetical ? "#8b0000" : "#006400",
                            fontSize: "12px",
                          }}
                        >
                          {person.yearStart} {person.isHypothetical ? "✘" : "✔"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <DownloadModal
        show={showDownload}
        onClose={() => setShowDownload(false)}
        totalCount={totalCount}
        visibleCount={visibleCount}
        onDownload={handleDownload}
        downloading={downloading}
      />

      <PlaceClusterModal
        show={showPlaceModal}
        onClose={() => setShowPlaceModal(false)}
        places={placeModalData}
      />
    </div>
  );
}