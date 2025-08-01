'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/app/components/ui/loading-spinner';

interface RedirectProps {
  children?: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  fallbackPath?: string;
}

const Redirect = ({
  children,
  requireAuth = false,
  allowedRoles = [],
  fallbackPath,
}: RedirectProps) => {
  const { isAuthenticated, isLoading, getUserRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const userRole = getUserRole();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Don't do anything while auth is loading
    if (isLoading) return;

    setIsRedirecting(true);

    // Handle authentication requirement
    if (requireAuth && !isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    // Handle role-based access
    if (requireAuth && isAuthenticated && allowedRoles.length > 0) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on user role
        if (userRole === 'craftsman') {
          router.replace('/sm/jobs');
          return;
        } else if (userRole === 'client') {
          router.replace('/sc/services');
          return;
        }
        // Fallback to login if role is unknown
        router.replace('/auth/login');
        return;
      }
    }

    // Handle authenticated users trying to access public/auth pages
    if (
      !requireAuth &&
      isAuthenticated &&
      (pathname.startsWith('/auth') ||
        pathname === '/' ||
        pathname.startsWith('/about') ||
        pathname.startsWith('/contact') ||
        pathname.startsWith('/faq') ||
        pathname.startsWith('/how-it-works'))
    ) {
      // Redirect to appropriate dashboard
      if (userRole === 'craftsman') {
        router.replace('/sm/jobs');
        return;
      } else if (userRole === 'client') {
        router.replace('/sc/services');
        return;
      }
    }

    // Handle fallback path
    if (fallbackPath && !isAuthenticated) {
      router.replace(fallbackPath);
      return;
    }

    // If we reach here, user is allowed to stay
    setIsRedirecting(false);
  }, [
    isAuthenticated,
    isLoading,
    userRole,
    requireAuth,
    allowedRoles,
    pathname,
    router,
    fallbackPath,
  ]);

  // Show loading spinner while checking auth or redirecting
  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="xl2" />
      </div>
    );
  }

  // If requireAuth is true and user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If role restrictions exist and user doesn't have required role, don't render children
  if (
    requireAuth &&
    allowedRoles.length > 0 &&
    (!userRole || !allowedRoles.includes(userRole))
  ) {
    return null;
  }

  // If no children provided (used as simple redirect component), return null
  if (!children) {
    return null;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default Redirect;
