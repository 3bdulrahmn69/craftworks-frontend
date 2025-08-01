import Redirect from '@/app/components/redirect';
import Footer from '@/app/components/footer';
import Header from '@/app/components/header';

const navLinks = [
  { key: 'jobs', href: '/sm/jobs' },
  { key: 'quotes', href: '/sm/quotes' },
  { key: 'invitations', href: '/sm/invitations' },
  { key: 'calendar', href: '/sm/calendar' },
  { key: 'messages', href: '/sm/messages' },
  { key: 'notifications', href: '/sm/notifications' },
];

const CraftsmanLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Redirect requireAuth={true} allowedRoles={['craftsman']}>
      <Header navLinks={navLinks} />
      {children}
      <Footer />
    </Redirect>
  );
};

export default CraftsmanLayout;
