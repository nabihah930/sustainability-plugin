import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';
import CarbonWidget from './Widgets/Carbon';
import EnergyWidget from './Widgets/Energy';
import BigTreeWidget from './Widgets/BigTree.js';
import styles from "./Styles/View.styles.js";

function View() {
  const [context, setContext] = useState();
  const [data, setData] = useState(null);
  const [sprint, setSprint] = useState(null);
  const [energyMessages, setEnergyMessages] = useState([]);
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);

  const getEnergyEquivalentMessages = (energyKWh) => {
    if (!energyKWh || energyKWh <= 0) {
      return ["Energy data not available"];
    }

    const homeHours = energyKWh.toFixed(1);
    const phoneCharges = Math.floor(energyKWh / 0.005);
    const slicesToasted = Math.floor(energyKWh / 0.06);
    const carKm = Math.floor(energyKWh / 0.2);
    const ledBulbHours = Math.floor(energyKWh / 0.01);

    return [
      `Equivalent to powering a typical home for ~${homeHours} hour${homeHours !== '1.0' ? 's' : ''}. 🏡`,
      `Enough energy to charge ~${phoneCharges} smartphones 🔋.`,
      `Could toast ~${slicesToasted} slices of bread 🍞.`,
      `Enough to drive an electric car for ~${carKm} km 🚗.`,
      `Could power ~${ledBulbHours} LED bulb-hours 💡.`,
    ];
  };

  const checkSprint = async () => {
    const result = await invoke('isSprintCompleted');
    console.log('Sprint check result:', result);
    if (result?.sprintId) {
      const details = await invoke('getSprintDetails', { sprintId: result.sprintId });
      console.log(details, "Sprint Details");
      setSprint(details);
      const energyKWh = 8; 
      setEnergyMessages(getEnergyEquivalentMessages(energyKWh));
    }
  };

  useEffect(() => {
    checkSprint();
  }, []);

  useEffect(() => {
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
  }, []);

  useEffect(() => {
    view.getContext().then(setContext);
  }, []);

  const prevMessage = () => {
    setCurrentMsgIndex((idx) => (idx === 0 ? energyMessages.length - 1 : idx - 1));
  };

  const nextMessage = () => {
    setCurrentMsgIndex((idx) => (idx === energyMessages.length - 1 ? 0 : idx + 1));
  };

  if (!context || !data || !sprint) {
    return 'Loading...';
  }

  return (
    <div style={{ ...styles.container, maxWidth: 900, margin: 'auto' }}>
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
          <BigTreeWidget />
          <h4>Trees Planted (Offset)</h4>
          <p style={styles.caption}>Calculates equivalent offsets using tree-planting data</p>
        </div>
      </div>

     <div style={styles.summaryBox}>
  <h3 style={styles.summaryHeading}>📋 Sprint Summary</h3>
  <table style={styles.summaryTable}>
    <tbody>
      <tr>
        <td style={styles.summaryRowTitle}>Sprint Name:</td>
        <td style={styles.summaryRowValue}>{sprint.name}</td>
      </tr>
      <tr>
        <td style={styles.summaryRowTitle}>Sprint ID:</td>
        <td style={styles.summaryRowValue}>{sprint.id}</td>
      </tr>
      <tr>
        <td style={styles.summaryRowTitle}>Duration:</td>
        <td style={styles.summaryRowValue}>
          {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
        </td>
      </tr>
      <tr>
        <td style={styles.summaryRowTitle}>Completed Story Points:</td>
        <td style={styles.summaryRowValue}>45 (example value)</td>
      </tr>
      <tr>
        <td style={styles.summaryRowTitle}>Goal:</td>
        <td style={styles.summaryRowValue}>{sprint.goal || "No goal defined for this sprint."}</td>
      </tr>
    </tbody>
  </table>

  <div style={styles.energyNavContainer}>
    <button 
      onClick={prevMessage} 
      aria-label="Previous energy message" 
      style={styles.energyButton}
    >
      ←
    </button>

    <div style={styles.energyMessageWrapper}>
    <span style={styles.energyMessage}>
      {energyMessages[currentMsgIndex]}
    </span>
  </div>

    <button 
      onClick={nextMessage} 
      aria-label="Next energy message" 
      style={styles.energyButton}
    >
      →
    </button>
  </div>
</div>


    </div>
  );
}

export default View;
