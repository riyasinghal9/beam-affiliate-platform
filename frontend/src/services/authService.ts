import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  beamNumber?: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    resellerId: string;
    level: string;
    balance: number;
    totalEarnings: number;
    totalSales: number;
    isAdmin?: boolean;
  };
}

export const authService = {
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async getMe(): Promise<AuthResponse['user']> {
    const response = await api.get('/auth/me');
    return response.data.user;
  },
}; 