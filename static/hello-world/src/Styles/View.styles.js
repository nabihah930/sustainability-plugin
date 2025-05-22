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
  caption: {
    color: '#666',
    fontSize: 13,
    marginTop: 4,
  },
  summaryBox: {
    marginTop: 40,
    padding: 24,
    border: '1px solid rgb(41 147 13)',
    borderRadius: 12,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  summaryHeading: {
    marginBottom: 20,
    color: '#2e7d32',
    textAlign: 'center',
    fontSize: '25px',
    fontWeight: 'bold',
  },
  summaryTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '16px',
  },
  summaryRowTitle: {
    fontWeight: 'bold',
    padding: '8px 16px',
    width: '40%',
    verticalAlign: 'top',
  },
  summaryRowValue: {
    padding: '8px 16px',
  },
energyNavContainer: {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 25,
  marginTop: 24,
},

energyButton: {
  cursor: 'pointer',
  fontSize: '35px',
  border: 'none',
  background: 'none',
  flexShrink: 0,
},

energyMessageWrapper: {
  width: '400px',
  textAlign: 'center',
},

energyMessage: {
  fontSize: 16,
  fontStyle: 'italic',
  whiteSpace: 'normal',
  wordWrap: 'break-word',
  marginTop:'5px'
},


};

export default styles;
