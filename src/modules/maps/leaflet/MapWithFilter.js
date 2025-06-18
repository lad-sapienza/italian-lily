import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapLeaflet, VectorLayer } from "../../scms.js";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { Bar, Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import getDataFromSource from "../../../services/getDataFromSource";
import { Link } from "gatsby";
import { Button } from "react-bootstrap";
import L from "leaflet";
import TutorialModal from "../../../usr/components/TutorialModal";

export default function MapWithFilter() {
  const [yearRange, setYearRange] = useState([1500, 1600]);
  const [histogramData, setHistogramData] = useState({ years: [], counts: [] });
  const [cityData, setCityData] = useState({ labels: [], values: [] });
  const [filteredPersons, setFilteredPersons] = useState([]);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
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
      color: '#ffffff',
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.6,
      radius: radius
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDataFromSource({
          dTable: "f_persone_f_luoghi",
          dEndPoint: process.env.GATSBY_DIRECTUS_API_URL,
          dToken: process.env.GATSBY_DIRECTUS_API_TOKEN,
          dQueryString: buildQuery(),
        });

        const filtered = data.filter(
          (item) =>
            item.prima_attestazione_anno >= yearRange[0] &&
            item.prima_attestazione_anno <= yearRange[1]
        );

        const yearCounts = {};
        const cityCounts = {};
        
        filtered.forEach((item) => {
          const year = item.prima_attestazione_anno;
          const city = item.f_luoghi_id?.nome_localita;

          if (year) yearCounts[year] = (yearCounts[year] || 0) + 1;
          if (city) cityCounts[city] = (cityCounts[city] || 0) + 1;
        });

        const years = Array.from({ length: 101 }, (_, i) => 1500 + i);
        const counts = years.map((year) => yearCounts[year] || 0);

        setHistogramData({ years, counts });
        setCityData({
          labels: Object.keys(cityCounts),
          values: Object.values(cityCounts),
        });

        setFilteredPersons(filtered.map(item => ({
          name: item.f_persone_id?.nome_e_cognome,
          city: item.f_luoghi_id?.nome_localita,
          yearStart: item.prima_attestazione_anno,
          yearEnd: item.ultima_attestazione_anno,
          isHypothetical: item.ipotizzato,
          isNullEnd: !item.ultima_attestazione_anno,
          id: item.f_persone_id?.id
        })));

      } catch (error) {
        console.error("Errore nel recupero dati:", error);
      }
    };
    fetchData();
  }, [buildQuery, yearRange]);

  const groupedPersons = filteredPersons.reduce((acc, person) => {
    const fullName = person.name ? person.name.split(" ").reverse().join(" ") : "Anonimo";
    if (!acc[fullName]) acc[fullName] = [];
    acc[fullName].push(person);
    return acc;
  }, {});

  return (
    <div 
      ref={mapContainerRef}
      style={{ 
        display: "flex", 
        height: "100vh", 
        flexDirection: "row", 
        position: "relative",
        backgroundColor: "#f5f2e9",
        fontFamily: "'Georgia', serif"
      }}
    >
      {/* Pulsante informazioni */}
      <div 
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1001,
          cursor: "pointer",
          backgroundColor: "rgba(255,255,255,0.9)",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
        }}
        onClick={() => setShowHelp(true)}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#5a4a3a" 
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>

      {/* Tutorial Modal */}
      <TutorialModal 
        show={showHelp} 
        onClose={() => setShowHelp(false)} 
      />

      {/* Mappa principale */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapLeaflet 
          height="100%" 
          center="48.8566,2.3522,5" 
          baseLayers={["OSM"]}
          style={{
            filter: "sepia(0.3) brightness(0.9) contrast(1.1)",
            borderRight: "1px solid #d4c9a8"
          }}
        >
          <VectorLayer
            name="Spostamenti"
            source={{
              dTable: "f_persone_f_luoghi",
              dEndPoint: process.env.GATSBY_DIRECTUS_API_URL,
              dToken: process.env.GATSBY_DIRECTUS_API_TOKEN,
              dQueryString: buildQuery(),
              geoField: "f_luoghi_id.coordinate",
            }}
            cluster={true}
            clusterOptions={{
              showCoverageOnHover: false,
              spiderfyOnMaxZoom: false,
              disableClusteringAtZoom: 12,
              maxClusterRadius: 40
            }}
            pointToLayer={(feature, latlng) => {
              return L.circleMarker(latlng, getClusterStyle(1));
            }}
            clusterToLayer={(cluster) => {
              const count = cluster.getChildCount();
              return L.circleMarker(cluster.getLatLng(), getClusterStyle(count));
            }}
          />
        </MapLeaflet>

        {/* Time slider */}
        <div style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "70%",
          padding: "10px 15px",
          backgroundColor: "transparent",
          border: "none",
          zIndex: 1000
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "5px",
            color: "#5a4a3a",
            fontSize: "14px"
          }}>
            <span>1500</span>
            <span style={{ 
              fontWeight: "bold",
              backgroundColor: "rgba(139, 69, 19, 0.1)",
              padding: "2px 10px",
              borderRadius: "12px",
              border: "1px solid rgba(139, 69, 19, 0.3)"
            }}>
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
            trackStyle={[{ 
              backgroundColor: "rgba(139, 69, 19, 0.7)",
              height: "4px"
            }]}
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
                cursor: "pointer"
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
                cursor: "pointer"
              }
            ]}
            railStyle={{ 
              backgroundColor: "rgba(139, 69, 19, 0.2)",
              height: "4px"
            }}
          />

          <div style={{ 
            width: "100%", 
            height: "50px", 
            marginTop: "8px"
          }}>
            <Bar
              data={{
                labels: histogramData.years,
                datasets: [{
                  data: histogramData.counts,
                  backgroundColor: histogramData.years.map(year =>
                    year >= yearRange[0] && year <= yearRange[1] ? 
                    "rgba(139, 69, 19, 0.6)" : "rgba(139, 69, 19, 0.15)"
                  ),
                  borderWidth: 0,
                  borderRadius: 2
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => `${ctx.raw} spostamenti nel ${ctx.label}`
                    },
                    displayColors: false,
                    backgroundColor: "rgba(91, 74, 58, 0.9)",
                    titleFont: { family: "'Georgia', serif" },
                    bodyFont: { family: "'Georgia', serif" }
                  }
                },
                scales: {
                  x: { display: false },
                  y: { display: false }
                },
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Pulsante pannello laterale */}
      <div style={{
        position: "absolute",
        top: "50%",
        right: isPanelCollapsed ? "20px" : "370px",
        transform: "translateY(-50%)",
        zIndex: 1001,
        transition: "right 0.3s ease"
      }}>
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
            backgroundImage: isPanelCollapsed 
              ? "url('data:images/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"%235a4a3a\"><path d=\"M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z\"/></svg>')"
              : "url('data:images/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"%235a4a3a\"><path d=\"M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z\"/></svg>')",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "24px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(210, 195, 160, 0.9)";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(245, 242, 233, 0.9)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        />
      </div>

      {/* Pannello laterale */}
      <div style={{
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
        flexDirection: "column"
      }}>
        <div style={{
          padding: "20px",
          borderBottom: "1px solid #d4c9a8",
          backgroundColor: "rgba(210, 195, 160, 0.3)"
        }}>
          <h2 style={{ 
            margin: 0, 
            color: "#5a4a3a",
            fontSize: "20px",
            fontWeight: "normal",
            fontStyle: "italic"
          }}>
            Movements
          </h2>
          <p style={{ 
            margin: "5px 0 0",
            color: "#7a6b5a",
            fontSize: "14px"
          }}>
            {yearRange[0]} - {yearRange[1]}
          </p>
        </div>

        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "15px"
        }}>
          <div style={{
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
            overflow: "hidden"
          }}>
            <Doughnut
              data={{
                labels: cityData.labels,
                datasets: [
                  {
                    label: "Spostamenti per città",
                    data: cityData.values,
                    backgroundColor: [
                      "#8b4513", "#a0522d", "#cd853f", "#deb887", "#f5deb3"
                    ],
                    borderColor: "#f5f2e9",
                    borderWidth: 2
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { 
                    display: true,
                    position: 'bottom',
                    labels: {
                      color: "#5a4a3a",
                      font: {
                        family: "'Georgia', serif",
                        size: 13
                      }
                    }
                  },
                },
                cutout: "60%"
              }}
            />
          </div>

          <div style={{ marginTop: "10px" }}>
            <h3 style={{ 
              color: "#5a4a3a",
              borderBottom: "1px solid #d4c9a8",
              paddingBottom: "5px",
              fontSize: "16px",
              margin: "0 0 15px"
            }}>
              People ({filteredPersons.length})
            </h3>
            
            {Object.keys(groupedPersons).map((name, index) => (
              <div key={index} style={{ 
                marginBottom: "15px",
                border: "1px solid #d4c9a8",
                borderRadius: "6px",
                overflow: "hidden",
                backgroundColor: "rgba(255,255,255,0.5)"
              }}>
                <Link 
                  to={`/record/?tb=f_persone&id=${groupedPersons[name][0].id}`} 
                  style={{ 
                    textDecoration: "none",
                    display: "block",
                    padding: "10px",
                    backgroundColor: "rgba(139, 69, 19, 0.1)",
                    borderBottom: "1px solid #d4c9a8",
                    color: "#5a4a3a",
                    fontWeight: "bold",
                    fontStyle: "italic"
                  }}
                >
                  {name}
                </Link>
                <div style={{ padding: "5px 10px" }}>
                  {groupedPersons[name].map((person, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: idx !== groupedPersons[name].length - 1 ? "1px dashed #d4c9a8" : "none",
                        fontSize: "14px",
                        color: "#5a4a3a"
                      }}
                    >
                      <span>{person.city}</span>
                      <span style={{
                        backgroundColor: person.isHypothetical ? "rgba(255,0,0,0.1)" : "rgba(0,128,0,0.1)",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        color: person.isHypothetical ? "#8b0000" : "#006400",
                        fontSize: "12px"
                      }}>
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
    </div>
  );
}