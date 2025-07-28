'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useLayoutEffect } from 'react';

const Redirect = ({ clientTo = '/sc/services', craftsmanTo = '/sm/jobs' }) => {
  const { isAuthenticated, isLoading, getUserRole } = useAuth();
  const router = useRouter();
  const userRole = getUserRole();

  useLayoutEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (userRole === 'craftsman') {
        router.replace(craftsmanTo);
      } else if (userRole === 'client') {
        router.replace(clientTo);
      }
    } else if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router, userRole, clientTo, craftsmanTo]);

  return null; // This component does not render anything
};

export default Redirect;
