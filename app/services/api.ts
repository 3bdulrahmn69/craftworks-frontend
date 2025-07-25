import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
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
