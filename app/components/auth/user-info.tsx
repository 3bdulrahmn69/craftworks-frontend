'use client';

import { useAuth } from '../../hooks/useAuth';

export default function UserInfo() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    getUserName, 
    getUserRole, 
    getUserEmail
  } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-sm text-gray-500">
        Not authenticated
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {user?.profile_image && (
        <img 
          src={user.profile_image} 
          alt="Profile" 
          className="w-8 h-8 rounded-full"
        />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">
          {getUserName()}
        </span>
        <span className="text-xs text-gray-500">
          {getUserEmail()} • {getUserRole()}
        </span>
      </div>
    </div>
  );
} 