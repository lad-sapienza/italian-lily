import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registriamo le componenti di Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = ({ labels, datasets, title }) => {
  const [fullscreen, setFullscreen] = useState(false);

  const chartData = {
    labels,
    datasets: datasets.map(dataset => ({
      ...dataset,
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderWidth: 2,
      tension: 0.3, // Per rendere la curva più fluida
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: !fullscreen,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { enabled: true, backgroundColor: 'rgba(0,0,0,0.7)', titleColor: 'white' },
      datalabels: { // Plugin per etichette sopra i punti
        display: fullscreen,
        color: 'black',
        anchor: 'end',
        align: 'top',
        font: { weight: 'bold', size: 14 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { display: fullscreen }, // Mostra solo in modalità espansa
      },
      y: {
        grid: { color: 'rgba(200, 200, 200, 0.3)' },
        ticks: { display: fullscreen },
      },
    },
  };

  return (
    <div style={{
      position: fullscreen ? 'fixed' : 'relative',
      top: 0,
      left: 0,
      width: fullscreen ? '100vw' : '95%',
      height: fullscreen ? '100vh' : 'auto',
      backgroundColor: fullscreen ? 'rgba(10, 10, 10, 0.9)' : 'transparent',
      zIndex: fullscreen ? 999 : 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      margin: '20px auto',
      padding: fullscreen ? '0' : '20px',
      borderRadius: '10px',
      boxShadow: fullscreen ? 'none' : '0px 4px 8px rgba(0, 0, 0, 0.2)',
    }}>
      <button
        onClick={() => setFullscreen(!fullscreen)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '30px',
          height: '30px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '5px',
          fontSize: '18px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        ⬜
      </button>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
