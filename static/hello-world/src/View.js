import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';
import styles from "./Styles/View.styles.js";
import SprintInsights from './SprintInsights.js';
import { getEnergyEquivalentMessages } from './util/helper.js';
import SprintSummary from './SprintSummary';
import AccessibilityCompliance from './AccessibilityCompliance.js';

function View() {
  const [context, setContext] = useState();
  const [data, setData] = useState(null);
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
    invoke('getSprintMetrics').then(setData);
    invoke('getSprintDetails').then(setSprint);
  }, []);

  useEffect(() => {
    invoke('getAccessibilityCompliance').then(setAccessibilityCompliance);
  }, []);

  if (!context || !sprint || !data) {
    return 'Loading...';
  }

  // Convert Joules to kWh for energy equivalency
  const totalEnergyKWh = data.total_energy_joules ? data.total_energy_joules / 3_600_000 : 0;
  const energyEquivalencies = getEnergyEquivalentMessages(totalEnergyKWh);

  return (
    <>
      <SprintInsights data={data} styles={styles} />
      <SprintSummary sprint={sprint} energyEquivalencies={energyEquivalencies} />
      <AccessibilityCompliance accessibilityCompliance={accessibilityCompliance} />
    </>
  );
}

export default View;
