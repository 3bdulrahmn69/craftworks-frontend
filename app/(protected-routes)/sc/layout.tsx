'use client';

import Redirect from '@/app/components/redirect';
import Footer from '@/app/components/footer';
import Header from '@/app/components/header';
import { usePathname } from 'next/navigation';

const navLinks = [
  { key: 'services', href: '/sc/services' },
  { key: 'MyJobs', href: '/sc/my-jobs' },
  { key: 'calendar', href: '/sc/calendar' },
  { key: 'messages', href: '/sc/messages' },
  { key: 'notifications', href: '/sc/notifications' },
];

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const getPath = usePathname();
  const isMessagesPage = getPath.startsWith('/sc/messages');
  return (
    <Redirect requireAuth={true} allowedRoles={['client']}>
      {!isMessagesPage && <Header navLinks={navLinks} />}
      {children}
      {!isMessagesPage && <Footer />}
    </Redirect>
  );
};

export default ClientLayout;
