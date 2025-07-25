import { api } from './api';
import { ApiResponse, User } from '../types/user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authAPI = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      ...credentials,
      type: 'public', // Assuming 'public' is the default type for the website login
    });
    return response.data.data;
  },

  // Register user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      credentials
    );
    return response.data.data;
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of server response
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-data');
      }
    }
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data.data;
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/auth/profile', data);
    return response.data.data;
  },
};

// Utility functions for token management
export const tokenUtils = {
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    return null;
  },

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
  },

  setUserData(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-data', JSON.stringify(user));
    }
  },

  getUserData(): User | null {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('user-data');
      return data ? JSON.parse(data) : null;
    }
    return null;
  },

  removeUserData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user-data');
    }
  },

  clearAll() {
    this.removeToken();
    this.removeUserData();
  },
};
