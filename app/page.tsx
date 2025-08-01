import Redirect from './components/redirect';
import Footer from './components/footer';
import Header from './components/header';
import CategoriesSection from './components/sections/services-section';
import CTASection from './components/sections/cta-section';
import HeroSection from './components/sections/hero-section';
import HowItWorksSection from './components/sections/how-it-works-section';
import TestimonialsSection from './components/sections/testimonials-section';

const navLinks = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'howitworks', href: '/how-it-works' },
  { key: 'contact', href: '/contact' },
  { key: 'faq', href: '/faq' },
];

export default function Home() {
  return (
    <Redirect>
      <Header navLinks={navLinks} />
      <HeroSection />
      <HowItWorksSection />
      <CategoriesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </Redirect>
  );
}
