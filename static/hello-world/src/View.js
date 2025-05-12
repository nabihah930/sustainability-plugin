import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';
import CarbonWidget   from './Widgets/Carbon';
import EnergyWidget   from './Widgets/Energy';
import BigTreeWidget  from './Widgets/BigTree';
import styles from './Styles/View.styles';

function View() {
  const [context, setContext] = useState();
  const [hello,   setHello]   = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [error,   setError]   = useState(null);

  // initial hello + context
  useEffect(() => { invoke('getText').then(setHello); view.getContext().then(setContext); }, []);

  
  const storeAndLogMetrics = async () => {
    try {
      await invoke('storeFixedMetrics');
      console.log('✅ Fixed metrics stored');

      const res = await invoke('getAllStoredMetrics');
      if (res.status === 'ok') {
        const rows = Object.entries(res.data).map(([k, v]) => ({
          Key: k,
          CarbonEmissions: v.carbonEmissions,
          EnergyUsed:      v.energyUsed,
          MemoryUsed:      v.memoryUsed,
          DataTransferred: v.dataTransferred,
          Timestamp:       new Date(v.timestamp).toLocaleString()
        }));
        console.table(rows);
      }
    } catch (e) {
      console.error('Store / log error:', e);
      setError('Could not store or log metrics');
    }
  };

  const fetchAndShowMetrics = async () => {
    try {
      const res = await invoke('getAllStoredMetrics');
      if (res.status === 'ok') {
        const rows = Object.entries(res.data).map(([k, v]) => ({ key: k, ...v }));
        setMetrics(rows);
      } else {
        setError('Failed to fetch metrics');
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setError('Failed to fetch metrics');
    }
  };

  if (!context || !hello) return <div style={styles.container}>Loading…</div>;

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
      <button onClick={storeAndLogMetrics} style={styles.button}>
        Store Fixed Metrics & Log Table
      </button>

      <button onClick={fetchAndShowMetrics} style={styles.button}>
        Show Stored Metrics in UI
      </button>

      {metrics.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Key</th><th>CO₂</th><th>Energy</th><th>Memory</th>
              <th>Data Tx</th><th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(m => (
              <tr key={m.key}>
                <td>{m.key}</td>
                <td>{m.carbonEmissions}</td>
                <td>{m.energyUsed}</td>
                <td>{m.memoryUsed}</td>
                <td>{m.dataTransferred}</td>
                <td>{new Date(m.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {error && <div style={styles.error}>{error}</div>}

      <p style={styles.footer}>
        Powered by Forge Storage • Track your team's sustainability impact
      </p>
    </div>
  );
}

export default View;
