import React, { useEffect, useState } from 'react';
import BarChart from './BarChart';
import LineChart from './LineChart';
import getDataFromSource from '../../services/getDataFromSource';

const GraphContainer = () => {
  const [chart1Data, setChart1Data] = useState({ labels: [], datasets: [] });
  const [chart2Data, setChart2Data] = useState({ labels: [], datasets: [] });
  const [filterValues, setFilterValues] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]); // Cambiato a un array

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDataFromSource({
          dTable: 'f_persone_f_luoghi',
          dEndPoint: process.env.GATSBY_DIRECTUS_API_URL,
          dToken: process.env.GATSBY_DIRECTUS_API_TOKEN,
          dQueryString: 'fields=*.*&limit=-1', // Recuperiamo i dati nidificati
        });

        // Estrarre tutte le professioni uniche da f_persone_id.professione
        const uniqueProfessions = [...new Set(data
          .map(item => item.f_persone_id?.professione)
          .filter(Boolean)
        )];

        setFilterValues(uniqueProfessions);
        
        const occurrencesYear = {};
        const occurrencesPlaces = {};

        data.forEach(item => {
          const year = item.prima_attestazione_anno;
          const placeName = item.f_luoghi_id?.nome_localita || 'Sconosciuto';
          const profession = item.f_persone_id?.professione;

          // Se ci sono filtri attivi e la professione non è inclusa, escludiamo il dato
          if (selectedFilters.length > 0 && !selectedFilters.includes(profession)) return;

          // Raggruppiamo per anno
          if (year !== null) {
            occurrencesYear[year] = (occurrencesYear[year] || 0) + 1;
          }

          // Raggruppiamo per località
          if (placeName !== null) {
            occurrencesPlaces[placeName] = (occurrencesPlaces[placeName] || 0) + 1;
          }
        });

        // Ordiniamo i dati per località
        const sortedPlaces = Object.entries(occurrencesPlaces)
          .sort((a, b) => b[1] - a[1])
          .reduce(
            (acc, [key, value]) => {
              acc.labels.push(key);
              acc.data.push(value);
              return acc;
            },
            { labels: [], data: [] }
          );

        // Impostiamo i dati nei grafici
        setChart1Data({
          labels: Object.keys(occurrencesYear).sort((a, b) => a - b),
          datasets: [
            {
              label: 'Years',
              data: Object.values(occurrencesYear),
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
          ],
        });

        setChart2Data({
          labels: sortedPlaces.labels,
          datasets: [
            {
              label: 'Places',
              data: sortedPlaces.data,
              backgroundColor: 'rgba(153, 102, 255, 0.6)',
              borderColor: 'rgba(153, 102, 255, 1)',
            },
          ],
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedFilters]); // Ricarica i dati ogni volta che i filtri cambiano

  // Funzione per selezionare/deselezionare una professione
  const toggleFilter = (profession) => {
    setSelectedFilters(prevFilters =>
      prevFilters.includes(profession)
        ? prevFilters.filter(p => p !== profession) // Rimuove se già selezionata
        : [...prevFilters, profession] // Aggiunge se non selezionata
    );
  };

  return (
    <div>
      {/* Contenitore per il filtro basato su PROFESSIONE */}
      <div style={{
        backgroundColor: 'rgba(10, 20, 50, 0.85)',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        color: 'white',
      }}>
        <h3>Select your parameter:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
          <button
            onClick={() => setSelectedFilters([])}
            style={{
              padding: '10px',
              borderRadius: '5px',
              backgroundColor: selectedFilters.length === 0 ? '#007bff' : 'white',
              color: selectedFilters.length === 0 ? 'white' : '#007bff',
              border: '2px solid #007bff',
              cursor: 'pointer',
            }}
          >
            All
          </button>
          {filterValues.map(value => (
            <button
              key={value}
              onClick={() => toggleFilter(value)}
              style={{
                padding: '10px',
                borderRadius: '5px',
                backgroundColor: selectedFilters.includes(value) ? '#007bff' : 'white',
                color: selectedFilters.includes(value) ? 'white' : '#007bff',
                border: '2px solid #007bff',
                cursor: 'pointer',
              }}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Contenitore per i due grafici affiancati */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '20px',
      }}>
        <div style={{ flex: '1', minWidth: '400px' }}>
          <LineChart
            labels={chart1Data.labels}
            datasets={chart1Data.datasets}
            title="Curva di Tendenza: Occorrenze per Anno"
          />
        </div>
        <div style={{ flex: '1', minWidth: '400px' }}>
          <BarChart
            labels={chart2Data.labels}
            datasets={chart2Data.datasets}
            title="Places"
          />
        </div>
      </div>
    </div>
  );
};

export default GraphContainer;
