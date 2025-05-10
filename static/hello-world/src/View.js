import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';
import CarbonWidget from './Widgets/Carbon';
import EnergyWidget from './Widgets/Energy';
import BigTreeWidget from './Widgets/BigTree.js';
import styles from "./Styles/View.styles.js";

function View() {
  const [context, setContext] = useState();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
  }, []);

  useEffect(() => {
    view.getContext().then(setContext);
  }, []);

  useEffect(() => {
    const storeFixedData = async () => {
      try {
        await invoke('storeFixedMetrics');
        console.log('Fixed metrics stored successfully');
      } catch (err) {
        console.error('Error storing fixed data:', err);
        setError('Failed to store fixed metrics.');
      }
    };

    storeFixedData();
  }, []);

  const logStoredMetricsAsTable = async () => {
    try {
      const response = await invoke('getAllStoredMetrics');
      if (response.status === 'ok') {
        const metricEntries = Object.entries(response.data).map(([key, value]) => ({
          Key: key,
          CarbonEmissions: value.carbonEmissions,
          EnergyUsed: value.energyUsed,
          MemoryUsed: value.memoryUsed,
          DataTransferred: value.dataTransferred,
          Timestamp: new Date(value.timestamp).toLocaleString()
        }));

        console.table(metricEntries);
      }
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
      setError('Error fetching stored metrics.');
    }
  };

  if (!context || !data) {
    return <div style={styles.container}>Loading sustainability data...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Sustainable Sprint Insights</h2>
      <p style={styles.description}>
        This plugin visualizes sustainability metrics such as energy use, estimated carbon emissions,
        and green coding contributions for your current sprint — sourced from your GitHub Actions data.
      </p>

      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <EnergyWidget />
          <h4>Energy Usage</h4>
          <p style={styles.caption}>Tracks energy consumed by recent builds</p>
        </div>

        <div style={styles.card}>
          <CarbonWidget />
          <h4>Carbon Emissions</h4>
          <p style={styles.caption}>Estimates CO₂ generated per commit pipeline</p>
        </div>

        <div style={styles.card}>
          <BigTreeWidget />
          <h4>Trees Planted (Offset)</h4>
          <p style={styles.caption}>Calculates equivalent offsets using tree-planting data</p>
        </div>
      </div>

      <button onClick={logStoredMetricsAsTable} style={styles.button}>
        Show Stored Metrics as Table
      </button>

      {error && <div style={styles.error}>{error}</div>}

      <p style={styles.footer}>
        Powered by Forge Storage • Track your team's sustainability impact
      </p>
    </div>
  );
}

export default View;
