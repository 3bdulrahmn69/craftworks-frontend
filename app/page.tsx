import Footer from './components/footer';
import Header from './components/header';
import CategoriesSection from './components/sections/categories-section';
import CTASection from './components/sections/cta-section';
import HeroSection from './components/sections/hero-section';
import HowItWorksSection from './components/sections/how-it-works-section';
import TestimonialsSection from './components/sections/testimonials-section';

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <HowItWorksSection />
      <CategoriesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </>
  );
}
