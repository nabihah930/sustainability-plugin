const styles = {
    buttonContainer: { 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: 30, 
    },
    fullPageButton: {
        background: 'none',
        border: 'none',
        padding: 0,
        color: '#0052cc',
        textDecoration: 'underline',
        cursor: 'pointer',
        fontSize: 14,
        fontFamily: 'inherit',
    },
    container: {
        padding: 15,
        fontFamily: 'Arial, sans-serif',
        width: '100%',
        maxWidth: 500,
        margin: '0 auto',
        boxSizing: 'border-box',
    },
    title: {
        textAlign: 'center',
        color: '#2c3e50',
        fontSize: 25,
        marginBottom: 20,
        marginTop: 20,
    },
    description: {
        visibility: 'hidden',
        display: 'none',
    },
    cardContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch',
        flexWrap: 'wrap',
        gap: 16,
        padding: 8,
    },
    card: {
        width: 150,
        padding: 10,
        borderRadius: 10,
        boxShadow: '0 1px 5px rgba(0, 0, 0, 0.08)',
        backgroundColor: '#ffffff',
        textAlign: 'center',
    },
    caption: {
        color: '#777',
        fontSize: 12,
        marginTop: 6,
    },
    widget: {
        width: '100%',
        maxWidth: '80px',
        height: 'auto',
        margin: '0 auto',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
    },
}

export default styles;
