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
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
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

      // If it's an authentication error, clear stored tokens
      if (error.response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
          localStorage.removeItem('user-data');
        }
      }
    }
    return Promise.reject(error);
  }
);
