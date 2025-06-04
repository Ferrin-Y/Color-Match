// Configuration for different environments
const config = {
    development: {
        API_BASE_URL: 'http://localhost:3000'
    },
    production: {
        API_BASE_URL: 'https://color-match.onrender.com'
    }
};

// Detect environment
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.port === '3000' ||
                     window.location.protocol === 'file:';

const currentConfig = isDevelopment ? config.development : config.production;

// Export the API base URL
window.API_BASE_URL = currentConfig.API_BASE_URL;