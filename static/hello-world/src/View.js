import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';
import BulbWidget from './Widgets/Bulb.js';
import HomeWidget from './Widgets/Home.js';
import ToastWidget from './Widgets/Toast.js';
import SmartphonesWidget from './Widgets/Smartphones.js'
import CarWidget from './Widgets/Car.js';
import styles from "./Styles/View.styles.js";
import SprintInsights from './SprintInsights.js';
import { calculateTreesNeeded, getEnergyEquivalentMessages } from './util/helper.js';
import { PLACEHOLDERS } from './util/constants.js';
import SprintSummary from './SprintSummary';

function View() {
  const [context, setContext] = useState();
  const [data, setData] = useState(null);
  const [sprint, setSprint] = useState(null);
  
  useEffect(() => {
    const loadContext = async () => {
      const ctx = await view.getContext();
      setContext(ctx);
    };

    loadContext();
  }, []);

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
    invoke('getSprintDetails').then(setSprint);
  }, []);

  if (!context || !data) {
    return 'Loading...';
  }

  const energyEquivalencies = getEnergyEquivalentMessages(data.total_energy_joules);

  return (
    <div>
      <SprintInsights data={data} styles={styles} />
      {/* The sprint summary message here */}
    </div>
  );
}

export default View;
