import axios from "axios";

// Create API instance for Python service via Node.js proxy
export const pythonAPI = axios.create({
  baseURL: import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:5000",
  withCredentials: true, // Include cookies for authentication
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
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
