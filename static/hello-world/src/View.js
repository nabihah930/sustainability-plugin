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
import SprintSummary from './SprintSummary';

function View() {
  const [context, setContext] = useState();
  const [data, setData] = useState(null);
  const [sprint, setSprint] = useState(null);
  const [compliance, setCompliance] = useState([]);
  
  useEffect(() => {
    invoke('getSprintMetrics').then(setData);
  }, []);

  useEffect(() => {
    view.getContext().then(setContext);
  }, []);

  useEffect(() => {
    invoke('getSprintDetails').then(setSprint);
  }, []);

  useEffect(() => {
    invoke('getSprintAccessibilityCompliance').then(setCompliance);
  }, []);

  if (!context || !data) {
    return 'Loading...';
  }

  const energyEquivalencies = getEnergyEquivalentMessages(data.total_energy_joules);

  return (
    <div>
      <div style={styles.insightsWrapperCard}>
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
        {/* impoarted SprintSummary component */}
        <SprintSummary sprint={sprint} energyEquivalencies={energyEquivalencies} />
      </div>
      {/* Accessibility Compliance Table */}
      <div style={styles.insightsWrapperCard}>
        <h2 style={styles.title}>Accessibility Compliance</h2>
        <p style={styles.description}>
          Issues in this sprint with submitted accessibility checklists and their compliance status.
        </p>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableCell}>Issue Key</th>
              <th style={styles.tableCell}>Checked Items</th>
              <th style={styles.tableCell}>Total Checked Items</th>
            </tr>
          </thead>
          <tbody>
            {compliance.length === 0 ? (
              <tr style={styles.tableRow}>
                <td style={styles.tableCell} colSpan={3}>No submitted checklists for this sprint.</td>
              </tr>
            ) : (
              compliance.map(({ issueKey, checklist }) => {
                const TOTAL_ITEMS = 12;
                const checkedItems = Object.entries(checklist)
                  .filter(([_, v]) => v)
                  .map(([k, _]) => k);
                const checked = checkedItems.length;
                return (
                  <tr key={issueKey} style={styles.tableRow}>
                    <td style={styles.tableCell}>{issueKey}</td>
                    <td style={styles.tableCell}>
                      {checked > 0
                        ? (
                          <ul style={styles.checkedItemsList}>
                            {checkedItems.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        )
                        : "—"
                      }
                    </td>
                    <td style={styles.tableCell}>{checked}/{TOTAL_ITEMS}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default View;
