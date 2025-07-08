'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { authAPI, tokenUtils } from '../../services/auth';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export default function LogoutButton({
  className = '',
  children,
  onClick,
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      // Logout from our backend
      await authAPI.logout();

      // Clear local storage
      tokenUtils.clearAll();

      // Logout from NextAuth
      await signOut({ redirect: false });

      // Call additional onClick handler if provided
      if (onClick) {
        onClick();
      }

      // Redirect to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if backend logout fails, clear local data and redirect
      tokenUtils.clearAll();
      await signOut({ redirect: false });

      if (onClick) {
        onClick();
      }

      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? 'Logging out...' : children || 'Logout'}
    </button>
  );
}
