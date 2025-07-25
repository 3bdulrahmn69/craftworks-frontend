'use client';

import { useSession } from 'next-auth/react';
import { tokenUtils } from '../services/auth';
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const user = session?.user;
  const token = session?.accessToken;

  // Get user data from localStorage as fallback (only on client)
  const localUserData = mounted ? tokenUtils.getUserData() : null;

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

    // Helper functions
    getUserRole: () => user?.role || localUserData?.role,
    getUserName: () => user?.name || localUserData?.fullName,
    getUserEmail: () => user?.email || localUserData?.email,
    getUserId: () => user?.id || localUserData?.id,
    getUserProfileImage: (): string =>
      user?.profilePicture || localUserData?.profilePicture || '',
    getUserPhone: () => localUserData?.phone,
    getUserAddress: () => localUserData?.address,
    getUserRating: () => localUserData?.rating,
    getUserRatingCount: () => localUserData?.ratingCount,

    // Check if user has specific role
    hasRole: (role: string) => {
      const userRole = user?.role || localUserData?.role;
      return userRole === role;
    },
  };
};
