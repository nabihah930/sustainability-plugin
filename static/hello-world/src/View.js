import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';
import MeterWidget from './Widgets/Meter.js';
import EnergyWidget from './Widgets/Energy';
import BigTreeWidget from './Widgets/BigTree.js';
import BulbWidget from './Widgets/Bulb.js';
import HomeWidget from './Widgets/Home.js';
import ToastWidget from './Widgets/Toast.js';
import SmartphonesWidget from './Widgets/Smartphones.js'
import CarWidget from './Widgets/Car.js';
import styles from "./Styles/View.styles.js";
import { calculateTreesNeeded, getEnergyEquivalentMessages } from './util/helper.js';
import { PLACEHOLDERS } from './util/constants.js';

function View() {
  const [context, setContext] = useState();
  const [data, setData] = useState(null);
  const [sprint, setSprint] = useState(null);
  
  useEffect(() => {
    invoke('getSprintMetrics').then(setData);
  }, []);

  useEffect(() => {
    view.getContext().then(setContext);
  }, []);

  useEffect(() => {
    invoke('getSprintDetails').then(setSprint);
  }, []);

  if (!context || !data) {
    return 'Loading...';
  }

  const energyEquivalencies = getEnergyEquivalentMessages(data.total_energy_joules);

  return (
    <div>
      <div style={styles.container}>
        <h2 style={styles.title}>Sustainable Sprint Insights</h2>
        <p style={styles.description}>
          {PLACEHOLDERS.dashboardDescription}
        </p>

        <div style={styles.cardContainer}>
          {/* Energy Card */}
          <div style={styles.card}>
            <EnergyWidget totalEnergyJoules={data.total_energy_joules} />
            <h4>Energy Usage</h4>
            <p style={styles.caption}>
              { data?.total_energy_joules != null
                ? (
                  <>
                    <strong>{data.total_energy_joules.toFixed(2)} Joules</strong> of energy consumed by recent builds
                  </>
                ) : (
                  PLACEHOLDERS.energyCaption
                )
              }
            </p>
          </div>

          {/* CPU Utilization Card */}
          <div style={styles.card}>
            <MeterWidget totalCPUpercent={data.avg_cpu_utilization_percent} />
            <h4>CPU Utilization</h4>
            <p style={styles.caption}>
              { data?.avg_cpu_utilization_percent != null
                ? (
                  <>
                    <strong>{data.avg_cpu_utilization_percent.toFixed(2)}%</strong> of CPU utilization per deployment pipeline
                  </>
                ) : (
                  PLACEHOLDERS.cpuCaption
                ) 
              }
            </p>
          </div>

          {/* Tree Card */}
          <div style={styles.card}>
            <BigTreeWidget />
            <h4>Trees Planted (Offset)</h4>
            <p style={styles.caption}>
              { calculateTreesNeeded(data.total_energy_joules) != null 
                ? (
                  <>
                    <strong>{calculateTreesNeeded(data.total_energy_joules)} trees</strong> needed to offset sprint emissions
                  </>
                ) : (
                  PLACEHOLDERS.treesCaption
                )
              }
            </p>
          </div>
        </div>
      </div>
      <div style={styles.container}>
        <h2 style={{ ...styles.title, marginTop: '40px',  marginBottom: '40px' }}>Sprint Summary</h2>
        {/* Sprint Summary Table */}
        <table style={styles.table}>
          <tbody>
            <tr style={styles.tableRow}>
              <td style={styles.tableCell}><strong>Sprint Name</strong></td>
              <td style={styles.tableCell}>{sprint?.name ?? "N/A"}</td>
            </tr>
            <tr style={styles.tableRow}>
              <td style={styles.tableCell}><strong>Start Date</strong></td>
              <td style={styles.tableCell}>{new Date(sprint?.startDate).toLocaleString() ?? "N/A"}</td>
            </tr>
            <tr style={styles.tableRow}>
              <td style={styles.tableCell}><strong>End Date</strong></td>
              <td style={styles.tableCell}>{new Date(sprint?.endDate).toLocaleString() ?? "N/A"}</td>
            </tr>
            <tr style={styles.tableRow}>
              <td style={styles.tableCell}><strong>State</strong></td>
              <td style={styles.tableCell}>{sprint?.state ?? "N/A"}</td>
            </tr>
          </tbody>
        </table>
        <div style={{...styles.cardContainer, gap: 15}}>
          {/* Home Card */}
          <div style={{...styles.card, width: 190}}>
            <HomeWidget />
            <p style={styles.caption}>
              { energyEquivalencies[0] }
            </p>
          </div>
          {/* Smartphones Card */}
          <div style={{...styles.card, width: 190}}>
            <SmartphonesWidget />
            <p style={styles.caption}>
              { energyEquivalencies[1] }
            </p>
          </div>
          {/* Toast Card */}
          <div style={{...styles.card, width: 190}}>
            <ToastWidget />
            <p style={styles.caption}>
              { energyEquivalencies[2] }
            </p>
          </div>
          {/* Car Card */}
          <div style={{...styles.card, width: 190}}>
            <CarWidget />
            <p style={styles.caption}>
              { energyEquivalencies[3] }
            </p>
          </div>
          {/* Bulb Card */}
          <div style={{...styles.card, width: 190}}>
            <BulbWidget />
            <p style={styles.caption}>
              { energyEquivalencies[4] }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default View;
