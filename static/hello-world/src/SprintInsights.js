import MeterWidget from './Widgets/Meter.js';
import EnergyWidget from './Widgets/Energy';
import BigTreeWidget from './Widgets/BigTree.js';
import { calculateTreesNeeded } from './util/helper.js';
import { PLACEHOLDERS } from './util/constants.js';

// Get styles as a parameter
function SprintInsights({ data, styles }) {
  return (
    <div style={styles.insightsWrapperCard}>
      <h2 style={styles.title}>Sustainable Sprint Insights</h2>
      <p style={styles.description}>
        {PLACEHOLDERS.dashboardDescription}
      </p>

      <div style={styles.cardContainer}>
        {/* Energy Card */}
        <div style={styles.card}>
          <EnergyWidget totalEnergyJoules={data.total_energy_joules} styles={styles}/>
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
          <MeterWidget totalCPUpercent={data.avg_cpu_utilization_percent} styles={styles} />
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
          <BigTreeWidget styles={styles} />
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

export default SprintInsights;
