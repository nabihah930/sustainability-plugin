import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';
import styles from "./Styles/View.styles.js";
import SprintInsights from './SprintInsights.js';
import { getEnergyEquivalentMessages } from './util/helper.js';
import SprintSummary from './SprintSummary';
import AccessibilityCompliance from './AccessibilityCompliance.js';

function View() {
  const [context, setContext] = useState();
  const [sprint, setSprint] = useState(null);
  const [accessibilityCompliance, setAccessibilityCompliance] = useState([]);

  useEffect(() => {
    const loadContext = async () => {
      const ctx = await view.getContext();
      setContext(ctx);
    };
    loadContext();
  }, []);

  useEffect(() => {
    invoke('getSprintDetails').then(setSprint);
  }, []);

  useEffect(() => {
    invoke('getAccessibilityCompliance').then(setAccessibilityCompliance);
  }, []);

  if (!context || !sprint) {
    return 'Loading...';
  }

  // Convert Joules to kWh for energy equivalency
  const totalEnergyKWh = sprint.total_energy_joules ? sprint.total_energy_joules / 3_600_000 : 0;
  const energyEquivalencies = getEnergyEquivalentMessages(totalEnergyKWh);

  return (
    <div style={styles.container}>
      <SprintInsights data={sprint} styles={styles} />
      <SprintSummary sprint={sprint} energyEquivalencies={energyEquivalencies} />
      <AccessibilityCompliance accessibilityCompliance={accessibilityCompliance} />
    </div>
  );
}

export default View;
