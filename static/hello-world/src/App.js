import React, { useEffect, useState } from 'react';
import { view } from '@forge/bridge';
import View from './View';
import Edit from './Edit';
import Panel from './panel';
import SprintPreview from './SprintPreview';

function App() {
  const [context, setContext] = useState();
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadContext = async () => {
      try {
        const ctx = await view.getContext();
        console.log("App Context:", ctx);
        
        // Always show panel if we're in an issue context
        if (ctx?.platformContext?.issueKey || 
            ctx?.extension?.issue?.key ||
            window.location.href.match(/\/browse\/[A-Z][A-Z0-9_]+-[0-9]+/i)) {
          setContext({ extension: { entryPoint: 'accessibility-checklist-panel' }});
          return;
        }

        setContext(ctx);
      } catch (err) {
        console.error("Context error:", err);
        setError(err.message);
      }
    };

    loadContext();
  }, []);

  if (error) {
    return <div style={{color: 'red', padding: '10px'}}>Error: {error}</div>;
  }

  if (!context) {
    return <div style={{padding: '10px', margin: '10px'}}>Loading...</div>;
  }

  // Show appropriate component based on module type
  if (window.location.pathname.includes('/global/sustainability-sidebar-icon')) {
    return <View />;
  }
  if (window.location.href.includes('accessibilityChecklist')) {
    return <Panel />;
  }
  if (window.location.href.includes('open-sprint-preview')) {
    return <SprintPreview />
  }

  // routing
  const key = context?.moduleKey || context?.extension?.entryPoint;
  switch (key) {
    case 'edit':
      return <Edit />;
    case 'accessibility-checklist-panel':
      return <Panel />;
    case 'open-sprint-preview':
      return <SprintPreview />
    case 'sustainability-sidebar-icon':
      return <View />
    default:
      return <View />;
  }
}

export default App;