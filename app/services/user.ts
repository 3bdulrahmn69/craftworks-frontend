import { api } from './api';
import { User, ApiResponse } from '@/app/types/user';

export interface UpdateUserData {
  fullName?: string;
  phone?: string;
  address?: {
    country: string;
    state: string;
    city: string;
    street: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const userService = {
  // Get current user profile
  getMe: async (token: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },

  // Update user profile
  updateProfile: async (
    token: string,
    userData: UpdateUserData
  ): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/me', userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },

  // Change password
  changePassword: async (
    token: string,
    passwordData: ChangePasswordData
  ): Promise<void> => {
    await api.put<ApiResponse<null>>('/auth/change-password', passwordData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Upload profile picture
  uploadProfilePicture: async (token: string, file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await api.post<ApiResponse<User>>(
      '/me/profile-picture',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },
};
