import axios from 'axios';
import { AuthResponse, LoginCredentials, SignupCredentials, PumpStats } from '../types/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
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

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/signup', credentials);
    return response.data;
  },
};

export const pumpAPI = {
  sendPump: async (): Promise<{ message: string; timestamp: string }> => {
    const response = await api.post('/api/pump');
    return response.data;
  },

  getStats: async (): Promise<PumpStats> => {
    const response = await api.get('/api/stats');
    return response.data;
  },
};

export const healthAPI = {
  check: async (): Promise<{ status: string; timestamp: string; discordReady: boolean }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;