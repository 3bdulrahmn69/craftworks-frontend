'use client';

import { useSession } from 'next-auth/react';
import { tokenUtils } from '../services/auth';

export const useAuth = () => {
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const user = session?.user;
  const token = session?.accessToken;

  // Get user data from localStorage as fallback
  const localUserData = tokenUtils.getUserData();
  const localToken = tokenUtils.getToken();

  return {
    // Session data
    session,
    user,
    token,

    // Status
    isAuthenticated,
    isLoading,

    // Local storage data (fallback)
    localUserData,
    localToken,

    // Helper functions
    getUserRole: () => user?.role || localUserData?.role,
    getUserName: () => user?.name || localUserData?.full_name,
    getUserEmail: () => user?.email,
    getUserId: () => user?.id || localUserData?.id,
    getUserProfileImage: (): string =>
      user?.profile_image || (localUserData?.profile_image as string),

    // Check if user has specific role
    hasRole: (role: string) => {
      const userRole = user?.role || localUserData?.role;
      return userRole === role;
    },
  };
};
