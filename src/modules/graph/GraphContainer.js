import React, { useEffect, useState } from 'react';
import BarChart from './BarChart';
import LineChart from './LineChart';
import getDataFromSource from '../../services/getDataFromSource';

const GraphContainer = () => {
  const [chart1Data, setChart1Data] = useState(null);
  const [chart2Data, setChart2Data] = useState(null);
  const [filterValues, setFilterValues] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Query per recuperare i dati principali
        const data = await getDataFromSource({
          dTable: 'f_persone_f_luoghi',
          dEndPoint: process.env.GATSBY_DIRECTUS_API_URL,
          dToken: process.env.GATSBY_DIRECTUS_API_TOKEN,
          dQueryString:
            'fields=prima_attestazione_anno,f_luoghi_id.nome_localita,spostato_in_qualita_di&limit=-1',
        });

        // Query per recuperare valori unici di 'spostato_in_qualita_di'
        const uniqueValues = await getDataFromSource({
          dTable: 'f_persone_f_luoghi',
          dEndPoint: process.env.GATSBY_DIRECTUS_API_URL,
          dToken: process.env.GATSBY_DIRECTUS_API_TOKEN,
          dQueryString: 'fields=spostato_in_qualita_di&distinct=spostato_in_qualita_di',
        });

        const occurrencesYear = {};
        const occurrencesPlaces = {};

        // Raggruppa i dati per anno e località
        data.forEach(item => {
          const year = item.prima_attestazione_anno;
          const placeName = item.f_luoghi_id?.nome_localita || 'Sconosciuto';

          // Applica filtro per professione
          if (selectedFilter && item.spostato_in_qualita_di !== selectedFilter) return;

          // Raggruppa per anno
          if (year !== null) {
            occurrencesYear[year] = (occurrencesYear[year] || 0) + 1;
          }

          // Raggruppa per località
          if (placeName !== null) {
            occurrencesPlaces[placeName] =
              (occurrencesPlaces[placeName] || 0) + 1;
          }
        });

        // Ordina i dati per località in base al numero di attestazioni
        const sortedPlaces = Object.entries(occurrencesPlaces)
          .sort((a, b) => b[1] - a[1]) // Ordina in ordine decrescente
          .reduce(
            (acc, [key, value]) => {
              acc.labels.push(key);
              acc.data.push(value);
              return acc;
            },
            { labels: [], data: [] }
          );

        setChart1Data({
          labels: Object.keys(occurrencesYear).sort((a, b) => a - b), // Ordina gli anni
          datasets: [
            {
              label: 'Occorrenze per Anno',
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
              label: 'Occorrenze per Località',
              data: sortedPlaces.data,
              backgroundColor: 'rgba(153, 102, 255, 0.6)',
              borderColor: 'rgba(153, 102, 255, 1)',
            },
          ],
        });

        setFilterValues([...new Set(uniqueValues.map(item => item.spostato_in_qualita_di))]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedFilter]);

  if (!chart1Data || !chart2Data) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div>
        <label htmlFor="filter">Spostato in Qualità di:</label>
        <select
          id="filter"
          onChange={e => setSelectedFilter(e.target.value)}
          value={selectedFilter || ''}
        >
          <option value="">Tutti</option>
          {filterValues.map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <LineChart
        labels={chart1Data.labels}
        datasets={chart1Data.datasets}
        title="Curva di Tendenza: Occorrenze per Anno"
      />
      <BarChart
        labels={chart2Data.labels}
        datasets={chart2Data.datasets}
        title="Occorrenze per Località"
      />
    </div>
  );
};

export default GraphContainer;
