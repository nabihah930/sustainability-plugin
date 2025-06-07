import React from 'react';
import styles from "./Styles/View.styles.js";
import HomeWidget from './Widgets/Home.js';
import SmartphonesWidget from './Widgets/Smartphones.js';
import ToastWidget from './Widgets/Toast.js';
import CarWidget from './Widgets/Car.js';
import BulbWidget from './Widgets/Bulb.js';

function SprintSummary({ sprint, energyEquivalencies }) {
  return (
    <div style={styles.sprintSummaryWrapperCard}>
      <h2 style={{ ...styles.title, ...styles.sprintSummaryTitle }}>Sprint Summary</h2>
      {/* Sprint Summary Table */}
      <table style={{ ...styles.sprintSummaryTable, marginLeft: 'auto', marginRight: 'auto', width: '60%' }}>
        <tbody>
          <tr style={styles.sprintSummaryTableRow}>
            <td style={styles.sprintSummaryTableCell}><strong>Sprint Name</strong></td>
            <td style={styles.sprintSummaryTableCell}>{sprint?.name ?? "N/A"}</td>
          </tr>
          <tr style={styles.sprintSummaryTableRow}>
            <td style={styles.sprintSummaryTableCell}><strong>Start Date</strong></td>
            <td style={styles.sprintSummaryTableCell}>{sprint?.startDate ? new Date(sprint.startDate).toLocaleString() : "N/A"}</td>
          </tr>
          <tr style={styles.sprintSummaryTableRow}>
            <td style={styles.sprintSummaryTableCell}><strong>End Date</strong></td>
            <td style={styles.sprintSummaryTableCell}>{sprint?.endDate ? new Date(sprint.endDate).toLocaleString() : "N/A"}</td>
          </tr>
          <tr style={styles.sprintSummaryTableRow}>
            <td style={styles.sprintSummaryTableCell}><strong>State</strong></td>
            <td style={styles.sprintSummaryTableCell}>{sprint?.state ?? "N/A"}</td>
          </tr>
        </tbody>
      </table>
      <div style={styles.sprintSummaryCardContainer}>
        {/* Home Card */}
        <div style={styles.sprintSummaryCard}>
          <HomeWidget />
          <p style={styles.caption}>
            { energyEquivalencies[0] }
          </p>
        </div>
        {/* Smartphones Card */}
        <div style={styles.sprintSummaryCard}>
          <SmartphonesWidget />
          <p style={styles.caption}>
            { energyEquivalencies[1] }
          </p>
        </div>
        {/* Toast Card */}
        <div style={styles.sprintSummaryCard}>
          <ToastWidget />
          <p style={styles.caption}>
            { energyEquivalencies[2] }
          </p>
        </div>
        {/* Car Card */}
        <div style={styles.sprintSummaryCard}>
          <CarWidget />
          <p style={styles.caption}>
            { energyEquivalencies[3] }
          </p>
        </div>
        {/* Bulb Card */}
        <div style={styles.sprintSummaryCard}>
          <BulbWidget />
          <p style={styles.caption}>
            { energyEquivalencies[4] }
          </p>
        </div>
      </div>
    </div>
  );
}

export default SprintSummary;
