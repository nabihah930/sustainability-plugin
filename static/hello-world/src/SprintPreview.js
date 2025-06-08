import { useEffect, useState } from 'react';
import { router, view, invoke } from '@forge/bridge';
import styles from './Styles/SprintPreview.styles.js';
import SprintInsights from './SprintInsights.js';

function SprintPreview() {
  const [data, setData] = useState(null);
  const [context, setContext] = useState();

  useEffect(() => {
    view.getContext().then(setContext);
  }, []);

  useEffect(() => {
    if (context) {
      invoke('storeRecentSprint', context);
      const sprintId = context.extension.sprint.id;
      invoke('getSprintMetrics', { sprintId }).then(setData);
    }
  }, [context]);

  if (!context || !data) {
    return 'Loading...';
  }

  const goToFullPage = async () => {
    router.navigate({target: 'module', moduleKey: 'sustainability-sidebar-icon'});
  };

  return (
    <div>
      <SprintInsights data={data} styles={styles} />
      <div style={styles.buttonContainer}>
        <button style={styles.fullPageButton} onClick={goToFullPage}>Open in full page</button>
      </div>
    </div>
  );
}

export default SprintPreview;
