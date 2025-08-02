import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  // Don't set default Content-Type here to allow FormData to set its own
});

// Add request interceptor to handle Content-Type based on data type
api.interceptors.request.use((config) => {
  // Only set Content-Type to application/json if it's not already set
  // and if the data is not FormData
  if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  // Token will be added manually where needed, not from localStorage
  return config;
});

// Add response interceptor to handle API response format
api.interceptors.response.use(
  (response) => {
    // For successful responses, return as is
    return response;
  },
  (error) => {
    // Handle error responses
    if (error.response?.data) {
      const errorData = error.response.data;

      // If the error response has the API format, extract the message
      if (errorData.message) {
        error.message = errorData.message;
      }

      // If it's an authentication error, no need to clear tokens since we don't store them
      if (error.response.status === 401) {
        // Handle unauthorized access
      }
    }
    return Promise.reject(error);
  }
);
