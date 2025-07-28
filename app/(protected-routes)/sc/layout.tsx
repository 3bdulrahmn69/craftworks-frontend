import Redirect from '@/app/components/auth/redirect';
import Footer from '@/app/components/footer';
import Header from '@/app/components/header';

const navLinks = [
  { key: 'services', href: '/sc/services' },
  { key: 'jobs', href: '/sc/my-jobs' },
  { key: 'messages', href: '/sc/messages' },
  { key: 'notifications', href: '/sc/notifications' },
];

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Redirect />
      <Header navLinks={navLinks} />
      {children}
      <Footer />
    </>
  );
};

export default ClientLayout;
