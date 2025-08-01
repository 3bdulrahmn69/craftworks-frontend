import Redirect from '@/app/components/auth/redirect';
import Footer from '@/app/components/footer';
import Header from '@/app/components/header';

const navLinks = [
  { key: 'services', href: '/sc/services' },
  { key: 'MyJobs', href: '/sc/my-jobs' },
  { key: 'messages', href: '/sc/messages' },
  { key: 'notifications', href: '/sc/notifications' },
];

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Redirect requireAuth={true} allowedRoles={['client']}>
      <Header navLinks={navLinks} />
      {children}
      <Footer />
    </Redirect>
  );
};

export default ClientLayout;
