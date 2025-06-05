import { useEffect, useState, Suspense, lazy } from 'react';
import { view, invoke } from '@forge/bridge';
import styles from "./Styles/View.styles.js";
import { calculateTreesNeeded } from './util/helper.js';
import { PLACEHOLDERS } from './util/constants.js';

const EnergyWidget = lazy(() => import('./Widgets/Energy'));
const MeterWidget = lazy(() => import('./Widgets/Meter.js'));
const BigTreeWidget = lazy(() => import('./Widgets/BigTree.js'));

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
          {/* <EnergyWidget totalEnergyJoules={data.total_energy_joules} /> */}
          <Suspense fallback={<div>Loading Energy Widget...</div>}>
            <EnergyWidget totalEnergyJoules={data.total_energy_joules} />
          </Suspense>
          <h4>Energy Usage</h4>
          <p style={styles.caption}>
            { data?.total_energy_joules != null
              ? (
                <>
                  {data.total_energy_joules.toFixed(2)} Joules of energy consumed by recent builds
                </>
              ) : (
                PLACEHOLDERS.energyCaption
              )
            }
          </p>
        </div>

        {/* CPU Utilization Card */}
        <div style={styles.card}>
          {/* <MeterWidget totalCPUpercent={data.avg_cpu_utilization_percent} /> */}
          <Suspense fallback={<div>Loading CPU Widget...</div>}>
            <MeterWidget totalCPUpercent={data.avg_cpu_utilization_percent} />
          </Suspense>
          <h4>CPU Utilization</h4>
          <p style={styles.caption}>
            { data?.avg_cpu_utilization_percent != null
              ? (
                <>
                  {data.avg_cpu_utilization_percent.toFixed(2)}% of CPU utilization per deployment pipeline
                </>
              ) : (
                PLACEHOLDERS.cpuCaption
              ) 
            }
          </p>
        </div>

        {/* Tree Card */}
        <div style={styles.card}>
          {/* <BigTreeWidget /> */}
          <Suspense fallback={<div>Loading Tree Widget...</div>}>
            <BigTreeWidget />
          </Suspense>
          <h4>Trees Planted (Offset)</h4>
          <p style={styles.caption}>
            { calculateTreesNeeded(data.total_energy_joules) != null 
              ? (
                <>
                  {calculateTreesNeeded(data.total_energy_joules)} trees needed to offset sprint emissions
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
