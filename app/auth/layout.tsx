'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, getUserRole } = useAuth();
  const router = useRouter();
  const userRole = getUserRole();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (userRole === 'craftsman') {
        router.replace('/jobs');
      } else if (userRole === 'client') {
        router.replace('/');
      }
    }
  }, [isAuthenticated, isLoading, router, userRole]);

  // Optionally, you can show a loading spinner while checking auth
  if (isLoading) return null;
  if (isAuthenticated) return null;

  return <>{children}</>;
}
