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
  const [closedSprints, setClosedSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [energyMessages, setEnergyMessages] = useState([]);
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [storyPoints, setStoryPoints] = useState(null);
  const [fields, setFields] = useState([]);

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

  
  // Fetch sprint details and set energy messages dynamically
 const fetchSprintDetails = async (sprintId) => {
  try {
    const details = await invoke('getSprintDetails', { sprintId });
    setSprint(details);

    // Fetch story points
    const spResult = await invoke('getSprintStoryPoints', { sprintId });
    const totalStoryPoints = spResult?.totalStoryPoints ?? 0;
    setStoryPoints(totalStoryPoints);  // <-- Add this state to render
    console.log(spResult,"avjhbk")
    const totalEnergy = details?.totalEnergy || 8;
    setEnergyMessages(getEnergyEquivalentMessages(totalEnergy));
    setCurrentMsgIndex(0);
  } catch (error) {
    console.error("Error fetching sprint details:", error);
  }
};



  const checkSprint = async () => {
    try {
      const result = await invoke('isSprintCompleted');
      if (result?.sprintId) {
        setClosedSprints(result.closedSprints || []);

        // Use the latest closed sprint as the default selected sprint
        const latestClosed = result.latestClosedSprint;
        if (latestClosed) {
          setSelectedSprintId(latestClosed.id);
          await fetchSprintDetails(latestClosed.id);
        } else {
          // Fallback to active or latest sprint if no closed sprint
          setSelectedSprintId(result.sprintId);
          await fetchSprintDetails(result.sprintId);
        }
      }
    } catch (error) {
      console.error("Error fetching sprint data:", error);
    }
  };
const handleSprintChange = async (e) => {
    const sprintId = e.target.value;
    setSelectedSprintId(sprintId);
    await fetchSprintDetails(sprintId);
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
useEffect(() => {
    const fetchFields = async () => {
      try {
        const result = await invoke('getFields');
        console.log(result); // Already logging the result
        setFields(result);
      } catch (error) {
        console.error('Error fetching fields:', error);
      }
    };

    fetchFields();
  }, []);
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);
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
        {closedSprints.length > 0 && (
          <>
            <span style={{ fontStyle: 'italic', color: '#666' }}>
              (Latest closed sprint: {closedSprints[closedSprints.length - 1].name})
            </span>
            <select
              value={selectedSprintId}
              onChange={handleSprintChange}
              aria-label="Select sprint report"
              style={{ marginLeft: 'auto', padding: '4px 8px', fontSize: '14px' }}
            >
              {closedSprints.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Existing sprint summary table */}
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
            <td style={styles.summaryRowValue}>{storyPoints !== null ? storyPoints : 'Not Found'}</td>
          </tr>
          <tr>
            <td style={styles.summaryRowTitle}>Goal:</td>
            <td style={styles.summaryRowValue}>{sprint.goal || "No goal defined for this sprint."}</td>
          </tr>
        </tbody>
      </table>

      {/* Energy nav and message as before */}
      <div style={styles.energyNavContainer}>
        <button onClick={prevMessage} aria-label="Previous energy message" style={styles.energyButton}>←</button>
        <div style={styles.energyMessageWrapper}>
          <span style={styles.energyMessage}>{energyMessages[currentMsgIndex]}</span>
        </div>
        <button onClick={nextMessage} aria-label="Next energy message" style={styles.energyButton}>→</button>
      </div>


    </div>
  );
}

export default View;
