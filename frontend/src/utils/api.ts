// API utility functions for consistent backend communication
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const api = {
  // Get the base API URL
  getBaseUrl: () => API_BASE_URL,
  
  // Get full API endpoint URL
  getEndpoint: (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`,
  
  // Make authenticated API calls
  authenticatedFetch: async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
    
    return fetch(api.getEndpoint(endpoint), {
      ...options,
      headers,
    });
  },
  
  // Make unauthenticated API calls
  fetch: async (endpoint: string, options: RequestInit = {}) => {
    return fetch(api.getEndpoint(endpoint), {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  }
};

export default api;
