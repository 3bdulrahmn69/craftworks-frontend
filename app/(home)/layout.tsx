'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

import Footer from '../components/footer';
import Header from '../components/header';

const navLinks = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'howitworks', href: '/how-it-works' },
  { key: 'contact', href: '/contact' },
  { key: 'faq', href: '/faq' },
];

export default function HomeLayout({
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

  return (
    <>
      <Header navLinks={navLinks} />
      {children}
      <Footer />
    </>
  );
}
