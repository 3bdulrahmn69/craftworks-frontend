import Footer from '@/app/components/footer';
import Header from '@/app/components/header';

const layout = ({ children }: { children: React.ReactNode }) => {
  const navLinks = [
    { key: 'jobs', href: '/jobs' },
    { key: 'quotes', href: '/quotes' },
    { key: 'invitations', href: '/invitations' },
    { key: 'messages', href: '/messages' },
    { key: 'notifications', href: '/notifications' },
  ];

  return (
    <>
      <Header navLinks={navLinks} />
      {children}
      <Footer />
    </>
  );
};

export default layout;
