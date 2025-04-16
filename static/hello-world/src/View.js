import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';
import CarbonWidget from './Widgets/Carbon';
import EnergyWidget from './Widgets/Energy';
import TreeWidget from './Widgets/Tree';
import styles from "./Styles/View.styles.js";

function View() {
  const [context, setContext] = useState();
  const [data, setData] = useState(null);

  useEffect(() => {
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
  }, []);

  useEffect(() => {
    view.getContext().then(setContext);
  }, []);

  if (!context || !data) {
    return 'Loading...';
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Sustainable Sprint Insights</h2>
      <p style={styles.description}>
        This plugin visualizes sustainability metrics such as energy use, estimated carbon emissions, 
        and green coding contributions for your current sprint — sourced from your GitHub Actions data.
      </p>

      <div style={styles.cardContainer}>
        {/* Energy Card */}
        <div style={styles.card}>
          <EnergyWidget />
          <h4>Energy Usage</h4>
          <p style={styles.caption}>Tracks energy consumed by recent builds</p>
        </div>

        {/* Carbon Card */}
        <div style={styles.card}>
          <CarbonWidget />
          <h4>Carbon Emissions</h4>
          <p style={styles.caption}>Estimates CO₂ generated per commit pipeline</p>
        </div>

        {/* Tree Card */}
        <div style={styles.card}>
          <TreeWidget />
          <h4>Trees Planted (Offset)</h4>
          <p style={styles.caption}>Calculates equivalent offsets using tree-planting data</p>
        </div>
      </div>
    </div>
  );
}

export default View;
