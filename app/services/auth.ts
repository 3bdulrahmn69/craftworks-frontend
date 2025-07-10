import { api } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    full_name: string;
    role: string;
    profile_image: string;
  };
}

export const authAPI = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', {
      ...credentials,
      type: 'clients', // Assuming 'clients' is the default type for the website login
    });
    return response.data;
  },

  // Register user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/register', credentials);
    return response.data;
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
  async getProfile(): Promise<AuthResponse['user']> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  async updateProfile(
    data: Partial<AuthResponse['user']>
  ): Promise<AuthResponse['user']> {
    const response = await api.put('/auth/profile', data);
    return response.data;
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

  setUserData(user: AuthResponse['user']) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-data', JSON.stringify(user));
    }
  },

  getUserData(): AuthResponse['user'] | null {
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
