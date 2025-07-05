import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/sections/HeroSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import CategoriesSection from '../components/sections/CategoriesSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import CTASection from '../components/sections/CTASection';

const HomePage = () => {
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
};

export default HomePage;
