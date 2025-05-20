const config = {
    apiBaseUrl: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`
    }
};

export default config;