import Redirect from '../components/redirect';
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
  return (
    <Redirect>
      <Header navLinks={navLinks} />
      {children}
      <Footer />
    </Redirect>
  );
}
