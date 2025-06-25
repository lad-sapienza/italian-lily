import React, { useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { withPrefix } from "gatsby"

function createLilyIcon({ size, opacity, brightness, shadow, border }) {
  const inner  = size * 0.7
  const offset = (size - inner) / 2
  // “image” perché la tua cartella è static/image/
  const url    = withPrefix("/image/icon_lily.svg")

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        opacity: ${opacity};
        transition: all 0.3s ease;
        filter: ${brightness};
        box-shadow: ${shadow};
        border: ${border};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.8);
      ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="${size}"
          height="${size}"
          viewBox="0 0 ${size} ${size}"
        >
          <image
            href="${url}"
            x="${offset}"
            y="${offset}"
            width="${inner}"
            height="${inner}"
            preserveAspectRatio="xMidYMid meet"
          />
        </svg>
      </div>
    `,
    className:   "custom-div-icon",
    iconSize:    [size, size],
    iconAnchor:  [size/2, size/2],
    popupAnchor: [0, -size/2],
  })
}

const ArrowMapWithTimeBar = ({ height, baseLayers, markers }) => {
  // Extract valid years from markers
  const validYears = markers
    .map(marker => marker.prima_attestazione_anno)
    .filter(year => year !== null && year !== undefined);

  const minYear = validYears.length > 0 ? Math.min(...validYears) : 1000;
  const maxYear = validYears.length > 0 ? Math.max(...validYears) : 2100;

  const [yearRange, setYearRange] = useState([minYear, maxYear]);
  const [activeHandle, setActiveHandle] = useState(null);
  const [movementIndices, setMovementIndices] = useState({});
  const getIndex = markerId => movementIndices[markerId] ?? 0;
  const rangeRef = useRef(null);
  const popupRefs = useRef({});

  // Calculate percentage position
  const getPositionFromValue = (value) => {
    return ((value - minYear) / (maxYear - minYear)) * 100;
  };

  // Handle range change
  const handleRangeChange = (index, value) => {
    const newRange = [...yearRange];
    newRange[index] = parseInt(value, 10);
    
    // Ensure first value <= second value
    if (index === 0 && newRange[0] > newRange[1]) {
      newRange[1] = newRange[0];
    } else if (index === 1 && newRange[1] < newRange[0]) {
      newRange[0] = newRange[1];
    }
    
    setYearRange(newRange);
  };

  // Handle mouse events with useCallback for stable reference
  const handleMouseMove = useCallback((e) => {
    if (activeHandle === null || !rangeRef.current) return;
    
    const rect = rangeRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.min(Math.max(x / rect.width, 0), 1);
    const year = Math.round(minYear + percentage * (maxYear - minYear));
    
    handleRangeChange(activeHandle, year);
  }, [activeHandle, minYear, maxYear]);

  const handleMouseDown = useCallback((index) => {
    setActiveHandle(index);
  }, []);

  const handleMouseUp = useCallback(() => {
    setActiveHandle(null);
  }, []);

  // Add event listeners for mouse move
  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Group markers by location
  const groupedMarkers = markers.reduce((acc, marker) => {
    if (!marker.lat || !marker.lng) return acc;

    const existingMarker = acc.find(m => m.lat === marker.lat && m.lng === marker.lng);

    const movement = {
      first: marker.prima_attestazione_anno || null,
      last: marker.ultima_attestazione_anno || null,
      resident: marker.residente || false,
      capacity: marker.spostato_in_qualita_di || "N/A",
      movement_notes: marker.note_sullo_spostamento || "",
    };

    if (existingMarker) {
      existingMarker.movements.push(movement);
    } else {
      acc.push({
        ...marker,
        movements: [movement],
      });
    }

    return acc;
  }, []);

  // Filter markers based on year range
  const filteredMarkers = groupedMarkers.map(marker => {
    const filteredMovements = marker.movements
      .filter(movement => movement.first >= yearRange[0] && movement.first <= yearRange[1])
      .sort((a, b) => b.first - a.first); // Sort from newest to oldest
    
    return {
      ...marker,
      movements: filteredMovements
    };
  }).filter(marker => marker.movements.length > 0);

  // Find most recent year among filtered markers
  const maxFilteredYear = Math.max(
    ...filteredMarkers
      .flatMap(marker => marker.movements.map(m => m.first))
      .filter(Boolean)
  );

  const generateIcon = (marker) => {
    const size       = 36
    const hasRecent  = marker.movements.some(m => m.first === maxFilteredYear)
    const opacity    = hasRecent ? 1 : 0.8
    const brightness = hasRecent ? "brightness(1)" : "brightness(0.8)"
    const shadow     = hasRecent ? "0 0 12px rgba(93,64,55,0.4)" : "none"
    const border     = hasRecent ? "2px solid #5d4037"    : "1px solid #9e9e9e"
  
    // Qui usi il nostro helper
    return createLilyIcon({ size, opacity, brightness, shadow, border })
  }

// handler generici
const handlePrevMovement = (markerId) => {
  setMovementIndices(prev => ({
    ...prev,
    [markerId]: Math.max(0, getIndex(markerId) - 1)
  }));
};

const handleNextMovement = (markerId, maxIndex) => {
  setMovementIndices(prev => ({
    ...prev,
    [markerId]: Math.min(maxIndex, getIndex(markerId) + 1)
  }));
};

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <MapContainer style={{ height }} center={[45, 4]} zoom={5}>
        {/* Base layers */}
        {baseLayers.map((layer, index) => (
          <TileLayer
            key={index}
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
        ))}

        {/* Markers and popups */}
        {filteredMarkers.map(marker => {
          const markerId = `${marker.lat}-${marker.lng}`;
          const idx = movementIndices[markerId] ?? 0;
          const maxIdx = marker.movements.length - 1;

          const currentMovement = marker.movements[idx];
          const hasMostRecent = currentMovement.first === maxFilteredYear;
          const hasPrev = idx > 0;
          const hasNext = idx < maxIdx;
          const period = currentMovement.first + (currentMovement.last ? ` - ${currentMovement.last}` : '');

          return (
            <Marker
              key={markerId}
              position={[marker.lat, marker.lng]}
              icon={generateIcon(marker)}
            >
              <Popup>
                <div
                  style={{
                    maxWidth: "300px",
                    maxHeight: "400px",
                    overflow: "auto",
                    padding: "12px",
                    fontFamily: "'Helvetica Neue', Arial, sans-serif"
                  }}
                >
                  <h3 style={{
                    margin: "0 0 8px 0",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#333",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "6px",
                    textAlign: "center"
                  }}>
                    {marker.popup}
                  </h3>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px"
                  }}>
                    <button
                      onClick={() => handlePrevMovement(markerId)}
                      disabled={!hasPrev}
                      aria-label="Previous movement"
                      style={{
                        visibility: hasPrev ? "visible" : "hidden",
                        background: "none",
                        border: "none",
                        fontSize: "20px",
                        cursor: "pointer",
                        color: "#5d4037",
                        padding: "5px 10px"
                      }}
                    >
                      &lt;
                    </button>

                    <div style={{ flex: 1, textAlign: "center" }}>
                      <strong style={{ color: "#5d4037" }}>{period}</strong>
                      {hasMostRecent && (
                        <div style={{
                          backgroundColor: "#5d4037",
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          marginTop: "4px",
                          display: "inline-block"
                        }}>
                          Most Recent
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleNextMovement(markerId, maxIdx)}
                      disabled={!hasNext}
                      aria-label="Next movement"
                      style={{
                        visibility: hasNext ? "visible" : "hidden",
                        background: "none",
                        border: "none",
                        fontSize: "20px",
                        cursor: "pointer",
                        color: "#5d4037",
                        padding: "5px 10px"
                      }}
                    >
                      &gt;
                    </button>
                  </div>

                  <div style={{ marginBottom: "8px" }}>
                    <strong>Moved as:</strong> {currentMovement.capacity}
                  </div>

                  {currentMovement.movement_notes && (
                    <div
                      style={{
                        fontSize: "14px",
                        lineHeight: "1.4",
                        color: "#555"
                      }}
                      dangerouslySetInnerHTML={{ __html: currentMovement.movement_notes }}
                    />
                  )}

                  <div style={{
                    textAlign: "center",
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "#999"
                  }}>
                    {idx + 1} of {marker.movements.length}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Time range slider */}
      <div style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
        maxWidth: "600px",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "8px",
        padding: "16px 20px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        zIndex: 1000
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
          fontSize: "14px",
          color: "#666"
        }}>
          <span>{minYear}</span>
          <span style={{ fontWeight: "600" }}>
            {yearRange[0]} - {yearRange[1]}
          </span>
          <span>{maxYear}</span>
        </div>

        <div 
          ref={rangeRef}
          style={{ 
            position: "relative",
            height: "24px",
            display: "flex",
            alignItems: "center"
          }}
          onMouseLeave={handleMouseUp}
          role="slider"
          aria-valuemin={minYear}
          aria-valuemax={maxYear}
          aria-valuenow={`${yearRange[0]} to ${yearRange[1]}`}
          tabIndex="0"
        >
          {/* Track */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "4px",
            backgroundColor: "#eee",
            borderRadius: "2px"
          }} />
          
          {/* Active range */}
          <div style={{
            position: "absolute",
            left: `${getPositionFromValue(yearRange[0])}%`,
            right: `${100 - getPositionFromValue(yearRange[1])}%`,
            height: "4px",
            backgroundColor: "#5d4037",
            borderRadius: "2px"
          }} />
          
          {/* Min value input */}
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={yearRange[0]}
            onChange={(e) => handleRangeChange(0, e.target.value)}
            onMouseDown={() => handleMouseDown(0)}
            style={{
              position: "absolute",
              width: "100%",
              height: "24px",
              opacity: 0,
              zIndex: 3,
              cursor: "pointer"
            }}
            aria-label="Minimum year"
          />
          
          {/* Max value input */}
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={yearRange[1]}
            onChange={(e) => handleRangeChange(1, e.target.value)}
            onMouseDown={() => handleMouseDown(1)}
            style={{
              position: "absolute",
              width: "100%",
              height: "24px",
              opacity: 0,
              zIndex: 4,
              cursor: "pointer"
            }}
            aria-label="Maximum year"
          />
          
          {/* Left handle */}
          <button
            style={{
              position: "absolute",
              left: `${getPositionFromValue(yearRange[0])}%`,
              transform: "translateX(-50%)",
              width: "18px",
              height: "18px",
              backgroundColor: "#5d4037",
              borderRadius: "50%",
              cursor: "pointer",
              zIndex: 5,
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              border: "none",
              padding: 0
            }}
            onMouseDown={() => handleMouseDown(0)}
            aria-label="Adjust minimum year"
          />
          
          {/* Right handle */}
          <button
            style={{
              position: "absolute",
              left: `${getPositionFromValue(yearRange[1])}%`,
              transform: "translateX(-50%)",
              width: "18px",
              height: "18px",
              backgroundColor: "#5d4037",
              borderRadius: "50%",
              cursor: "pointer",
              zIndex: 5,
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              border: "none",
              padding: 0
            }}
            onMouseDown={() => handleMouseDown(1)}
            aria-label="Adjust maximum year"
          />
        </div>
      </div>
    </div>
  );
};

export default ArrowMapWithTimeBar;