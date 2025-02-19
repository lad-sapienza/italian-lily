import React, { useState, useEffect, useRef, useMemo } from 'react';
import './TimeSlider.css';

const TimeSlider = () => {
  const characterData = useMemo(
    () => [
      {
        carattere: '精',
        data: [
          {
            anno: 100,
            romanizzazione: 'NA',
            definizione: ['high-quality rice'],
            fonte: '<em>Shuowen jiezi</em>',
            note: 'Approximate date',
          },
          {
            anno: 1694,
            romanizzazione: '<em>çing</em> (/tsiŋ/)',
            definizione: ['high-quality rice', 'essence'],
            fonte: 'Rinuccini',
          },
          {
            anno: 1743,
            romanizzazione: '<em>(/tɕiŋ/)</em>',
            definizione: ['high-quality rice', 'essence'],
            fonte: '<em>Yuanyin zhengkao</em> 圓音正考 (1743)',
          },
        ],
      },
    ],
    []
  );

  const [selectedCharacter, setSelectedCharacter] = useState('精');
  const [year, setYear] = useState(2024);
  const [lines, setLines] = useState([]);

  const detailRefs = useRef([]);
  const definitionRefs = useRef({});

  useEffect(() => {
    detailRefs.current = [];
    definitionRefs.current = {};
  }, [characterData]);

  const handleCharacterChange = (e) => {
    setSelectedCharacter(e.target.value);
  };

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value, 10));
  };

  const selectedCharacterData = characterData.find(
    (char) => char.carattere === selectedCharacter
  );

  const filteredData = useMemo(() => {
    return selectedCharacterData
      ? selectedCharacterData.data.filter((item) => item.anno <= year)
      : [];
  }, [selectedCharacterData, year]);

  const groupedDefinitions = useMemo(() => {
    const grouped = {};
    filteredData.forEach((item) => {
      item.definizione.forEach((def) => {
        if (!grouped[def]) {
          grouped[def] = [];
        }
        grouped[def].push(item.anno);
      });
    });
    return grouped;
  }, [filteredData]);

  useEffect(() => {
    const newLines = [];
    Object.entries(groupedDefinitions).forEach(([def, years]) => {
      years.forEach((anno) => {
        const detailBox = detailRefs.current.find(
          (ref) => ref && ref.dataset && ref.dataset.anno === `${anno}`
        );
        const definitionBox = definitionRefs.current[def];

        if (detailBox && definitionBox) {
          const detailRect = detailBox.getBoundingClientRect();
          const definitionRect = definitionBox.getBoundingClientRect();

          newLines.push({
            x1: detailRect.left + detailRect.width / 2,
            y1: detailRect.bottom + window.scrollY,
            x2: definitionRect.left + definitionRect.width / 2,
            y2: definitionRect.top + window.scrollY,
          });
        } else {
          console.warn(
            `Missing reference: ${!detailBox ? 'Detail box' : ''} ${
              !definitionBox ? 'Definition box' : ''
            }`
          );
        }
      });
    });
    setLines(newLines);
  }, [filteredData, groupedDefinitions]);

  return (
    <div className="timeline-container">
      <h1>Chinese Characters Timeline</h1>

      <div className="search-bar">
        <label htmlFor="character-select">Select a character:</label>
        <select
          id="character-select"
          value={selectedCharacter}
          onChange={handleCharacterChange}
        >
          {characterData.map((char, index) => (
            <option key={index} value={char.carattere}>
              {char.carattere}
            </option>
          ))}
        </select>
      </div>

      <div className="timeline">
        <h2>Information about: {selectedCharacter}</h2>
        <input
          id="year-slider"
          type="range"
          min="-1000"
          max="2024"
          step="1"
          value={year}
          onChange={handleYearChange}
          className="year-slider"
        />
        <span className="current-year">Selected year: {year}</span>
      </div>

      <div className="data-container">
        <div className="data-row">
          {filteredData.map((item, index) => (
            <div
              key={index}
              className="data-box"
              ref={(el) => {
                if (el) detailRefs.current[index] = el;
              }}
              data-anno={item.anno}
            >
              <div className="data-content">
                <strong>Year:</strong> {item.anno} <br />
                <strong>Romanisation:</strong>{' '}
                <span dangerouslySetInnerHTML={{ __html: item.romanizzazione }} />
                <br />
                <strong>Source:</strong>{' '}
                <span dangerouslySetInnerHTML={{ __html: item.fonte }} />
                {item.note && (
                  <>
                    <br />
                    <strong>Note:</strong> {item.note}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="definitions-container">
        {Object.entries(groupedDefinitions).map(([def, years], index) => (
          <div
            key={index}
            className="definition-box"
            ref={(el) => {
              if (el) definitionRefs.current[def] = el;
            }}
          >
            <span>{def}</span>
          </div>
        ))}
      </div>

      <svg className="lines-container">
        {lines.map((line, index) => (
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="black"
            strokeWidth="2"
          />
        ))}
      </svg>
    </div>
  );
};

export default TimeSlider;
