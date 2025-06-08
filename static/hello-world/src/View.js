import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';
import styles from "./Styles/View.styles.js";
import SprintInsights from './SprintInsights.js';

function View() {
  const [context, setContext] = useState();
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadContext = async () => {
      const ctx = await view.getContext();
      setContext(ctx);
    };

    loadContext();
  }, []);

  useEffect(() => {
    invoke('getSprintMetrics').then(setData);
  }, []);

  if (!context || !data) {
    return 'Loading...';
  }

  return (
    <div>
      <SprintInsights data={data} styles={styles} />
      {/* The sprint summary message here */}
    </div>
  );
}

export default View;
