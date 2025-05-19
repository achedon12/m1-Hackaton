const config = {
    apiBaseUrl: 'http://localhost:1081/api',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`
    }
};

export default config;