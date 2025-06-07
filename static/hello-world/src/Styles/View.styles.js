const styles = {
  container: {
    padding: 20,
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    color: '#2c3e50',
  },
  description: {
    textAlign: 'center',
    color: '#555',
    marginBottom: 30,
  },
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: 30,
    flexWrap: 'wrap',
  },
  card: {
    width: 220,
    padding: 15,
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    textAlign: 'center',
  },
  animationContainer: {
    width: '100%',
    height: 120,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    margin: '0 auto',
  },
  caption: {
    color: '#666',
    fontSize: 13,
    marginTop: 4,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '24px',
  },
  tableRow: {
    // borderBottom: '1px solid #ccc',
  },
  tableCell: {
    padding: '8px 12px',
    textAlign: 'center',
    justifyContent: 'center',
    fontSize: 18,
  },
  // Sprint Summary styles
  sprintSummaryTitle: {
    marginTop: '40px',
    marginBottom: '40px',
  },
  sprintSummaryTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '24px',
  },
  sprintSummaryTableRow: {
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  sprintSummaryTableCell: {
    padding: '8px 12px',
    textAlign: 'center',
    justifyContent: 'center',
    fontSize: 18,
    verticalAlign: 'middle',
  },
  sprintSummaryCardContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: 10, // reduced gap for tighter fit
    flexWrap: 'nowrap', // prevent wrapping to keep in one line
    overflowX: 'auto', // allow horizontal scroll if needed
  },
  sprintSummaryCard: {
    width: 120, // reduced width
    padding: 10, // reduced padding
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    flex: '0 0 auto', // prevent shrinking
  },
  sprintSummaryWrapperCard: {
    width: '100%',
    maxWidth: 900,
    margin: '0 auto',
    padding: 24,
    borderRadius: 16,
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    backgroundColor: '#f9f9f9',
    marginBottom: 32,
    minHeight: 260, 
  },
  insightsWrapperCard: {
    width: '100%',
    maxWidth: 900,
    margin: '0 auto',
    padding: 24,
    borderRadius: 16,
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    backgroundColor: '#f9f9f9',
    marginBottom: 32,
  },
};

export default styles;
