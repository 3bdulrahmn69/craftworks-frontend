'use client';

import Redirect from '@/app/components/redirect';
import Footer from '@/app/components/footer';
import Header from '@/app/components/header';
import { usePathname } from 'next/navigation';

const navLinks = [
  { key: 'jobs', href: '/sm/jobs' },
  { key: 'quotes', href: '/sm/quotes' },
  { key: 'invitations', href: '/sm/invitations' },
  { key: 'calendar', href: '/sm/calendar' },
  { key: 'messages', href: '/sm/messages' },
  { key: 'notifications', href: '/sm/notifications' },
];

const CraftsmanLayout = ({ children }: { children: React.ReactNode }) => {
  const getPath = usePathname();
  const isMessagesPage = getPath.startsWith('/sm/messages');

  return (
    <Redirect requireAuth={true} allowedRoles={['craftsman']}>
      {!isMessagesPage && <Header navLinks={navLinks} />}
      {children}
      {!isMessagesPage && <Footer />}
    </Redirect>
  );
};

export default CraftsmanLayout;
