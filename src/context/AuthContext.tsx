import { createContext, useReducer, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authService } from '../services/auth';
import { toast } from 'react-toastify';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  role: 'client' | 'craftsman';
  clientId?: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initUser = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const token = localStorage.getItem('token');
        if (user && token) {
          authService.setToken(token);
          dispatch({ type: 'SET_USER', payload: user });
        } else {
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        dispatch({ type: 'SET_USER', payload: null });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initUser();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { token, user } = await authService.login(email, password);
      authService.setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'SET_USER', payload: user });
      toast.success('Login successful!');
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const errorMessage = error.response?.data?.error || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { token, user } = await authService.register(data);
      authService.setToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'SET_USER', payload: user });
      toast.success('Account created successfully!');
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const errorMessage = error.response?.data?.error || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateProfile = async (data: {
    name?: string;
    email?: string;
  }): Promise<void> => {
    try {
      const { user } = await authService.updateProfile(data);
      dispatch({ type: 'SET_USER', payload: user });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || 'Failed to update profile';
      toast.error(errorMessage);
      throw error;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully!');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || 'Failed to change password';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.clearToken();
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
