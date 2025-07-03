import { api } from './api';
import type { User, AuthResponse } from '../types';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'client' | 'craftsman';
  clientId?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(data: {
    name?: string;
    email?: string;
  }): Promise<{ user: User }> {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors during logout
      console.warn('Logout API call failed:', error);
    }
  },

  setToken(token: string) {
    localStorage.setItem('token', token);
    // Update API default headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  clearToken() {
    localStorage.removeItem('token');
    // Remove from API default headers
    delete api.defaults.headers.common['Authorization'];
  },

  // Check if token is valid (basic check)
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic JWT structure check
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);

      return payload.exp > now;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },
};
