import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';
import CarbonWidget from './Widgets/Carbon';
import EnergyWidget from './Widgets/Energy';
import TreeWidget from './Widgets/Tree';

function View() {
  const [context, setContext] = useState();
  const [data, setData] = useState(null);

  useEffect(() => {
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
  }, []);

  useEffect(() => {
    view.getContext().then(setContext);
  }, []);

  if (!context || !data) {
    return 'Loading...';
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Sustainable Sprint Insights</h2>
      <p style={{ textAlign: 'center', color: '#555', marginBottom: '30px' }}>
        This plugin visualizes sustainability metrics such as energy use, estimated carbon emissions, 
        and green coding contributions for your current sprint — sourced from your GitHub Actions data.
      </p>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '30px',
        flexWrap: 'wrap',
      }}>
        {/* Energy Card */}
        <div style={cardStyle}>
          {/* <EnergyWidget /> */}
          <h4>Energy Usage</h4>
          <p style={captionStyle}>Tracks energy consumed by recent builds</p>
        </div>

        {/* Carbon Card */}
        <div style={cardStyle}>
          {/* <CarbonWidget /> */}
          <h4>Carbon Emissions</h4>
          <p style={captionStyle}>Estimates CO₂ generated per commit pipeline</p>
        </div>

        {/* Tree Card */}
        <div style={cardStyle}>
          {/* <TreeWidget /> */}
          <h4>Trees Planted (Offset)</h4>
          <p style={captionStyle}>Calculates equivalent offsets using tree-planting data</p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  width: '220px',
  padding: '15px',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  backgroundColor: '#ffffff',
  textAlign: 'center',
};

const captionStyle = {
  color: '#666',
  fontSize: '13px',
};

export default View;
