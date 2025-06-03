import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';
import MeterWidget from './Widgets/Meter.js';
import EnergyWidget from './Widgets/Energy';
import BigTreeWidget from './Widgets/BigTree.js';
import styles from "./Styles/View.styles.js";
import { calculateTreesNeeded } from './util/helper.js';
import { PLACEHOLDERS } from './util/constants.js';

function View() {
  const [context, setContext] = useState();
  const [data, setData] = useState(null);

  useEffect(() => {
    invoke('getSprintMetrics').then(setData);
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
  );
}

export default View;
