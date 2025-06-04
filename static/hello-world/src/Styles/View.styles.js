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
};

export default styles;
