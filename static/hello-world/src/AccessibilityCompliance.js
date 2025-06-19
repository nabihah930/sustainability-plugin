import React from 'react';
import accessibilityComplianceStyles from "./Styles/AccessibilityCompliance.styles.js";
import styles from "./Styles/View.styles.js";

function AccessibilityCompliance({ accessibilityCompliance }) {
  return (
    <div style={accessibilityComplianceStyles.section}>
      <h2 style={styles.title}>Accessibility Compliance</h2>
      <div style={{ textAlign: 'center', color: '#555', marginBottom: 12 }}>
        Issues in this sprint with checked accessibility checklist items and their compliance status
      </div>
      <table style={accessibilityComplianceStyles.table}>
        <thead>
          <tr style={accessibilityComplianceStyles.header}>
            <th style={accessibilityComplianceStyles.cell}>Issue Key</th>
            <th style={accessibilityComplianceStyles.cell}>Checked Items</th>
            <th style={accessibilityComplianceStyles.cell}>Total Checked Items</th>
          </tr>
        </thead>
        <tbody>
          {accessibilityCompliance.length === 0 ? (
            <tr>
              <td style={accessibilityComplianceStyles.cell} colSpan={3}>No checklist data found for this sprint.</td>
            </tr>
          ) : (
            accessibilityCompliance.map(row => (
              <tr key={row.issueKey}>
                <td style={accessibilityComplianceStyles.cell}>{row.issueKey}</td>
                <td style={accessibilityComplianceStyles.cell}>
                  {Array.isArray(row.checkedItems) && row.checkedItems.length > 0
                    ? row.checkedItems.map((item, idx) => (
                        <div key={idx}>{item}</div>
                      ))
                    : '—'}
                </td>
                <td style={accessibilityComplianceStyles.cell}>
                  {row.checkedCount}/12
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AccessibilityCompliance;
