const axios = require('axios');

// Create API instance for Python service
const pythonAPI = axios.create({
  baseURL: process.env.PYTHON_SERVICE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include user token
pythonAPI.interceptors.request.use(
  (config) => {
    // The token will be added from the request context
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

module.exports = pythonAPI;
