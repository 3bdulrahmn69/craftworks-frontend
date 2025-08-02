import { api } from './api';
import { User, ApiResponse, RecommendedCraftsman } from '@/app/types/user';

export interface UpdateUserData {
  fullName?: string;
  phone?: string;
  address?: {
    country: string;
    state: string;
    city: string;
    street: string;
  };
  serviceId?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
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
    const response = await api.put<ApiResponse<User>>('/users/me', userData, {
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
    await api.post<ApiResponse<null>>('/auth/change-password', passwordData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Upload profile picture
  uploadProfilePicture: async (token: string, file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await api.put<ApiResponse<User>>('/users/me', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Delete profile picture
  deleteProfilePicture: async (token: string): Promise<User> => {
    const response = await api.delete<ApiResponse<User>>(
      '/users/me/profile-picture',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  },

  // Get recommended craftsmen for a job
  getRecommendations: async (
    token: string,
    jobId: string
  ): Promise<RecommendedCraftsman[]> => {
    const response = await api.get<ApiResponse<RecommendedCraftsman[]>>(
      `/users/recommendations?jobId=${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  },
};
