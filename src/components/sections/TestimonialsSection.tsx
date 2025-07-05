import { useTranslation } from 'react-i18next';
import Container from '../ui/Container';

const TestimonialsSection = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const testimonials = [
    {
      name: t('testimonials.testimonial1.name', 'Sarah Ahmed'),
      role: t('testimonials.testimonial1.role', 'Homeowner'),
      content: t(
        'testimonials.testimonial1.content',
        'Found an excellent electrician through this platform. Professional, punctual, and did a fantastic job with my home wiring. Highly recommend!'
      ),
      rating: 5,
      avatar: 'SA',
    },
    {
      name: t('testimonials.testimonial2.name', 'Mohammed Hassan'),
      role: t('testimonials.testimonial2.role', 'Carpenter'),
      content: t(
        'testimonials.testimonial2.content',
        'This platform has helped me find consistent work and build my client base. The payment system is secure and the support team is very helpful.'
      ),
      rating: 5,
      avatar: 'MH',
    },
    {
      name: t('testimonials.testimonial3.name', 'Fatima Ali'),
      role: t('testimonials.testimonial3.role', 'Business Owner'),
      content: t(
        'testimonials.testimonial3.content',
        'I needed urgent plumbing repairs for my restaurant. Found a reliable plumber within hours and the work was completed professionally.'
      ),
      rating: 5,
      avatar: 'FA',
    },
  ];

  const stats = [
    {
      number: '10,000+',
      label: t('testimonials.stats.completedProjects', 'Completed Projects'),
    },
    {
      number: '5,000+',
      label: t('testimonials.stats.happyClients', 'Happy Clients'),
    },
    {
      number: '2,000+',
      label: t('testimonials.stats.verifiedCraftsmen', 'Verified Craftsmen'),
    },
    {
      number: '4.8★',
      label: t('testimonials.stats.averageRating', 'Average Rating'),
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section className="py-20 bg-background">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('testimonials.title', 'What Our Users Say')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t(
              'testimonials.subtitle',
              'Join thousands of satisfied clients and craftsmen who trust our platform for their projects.'
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-muted rounded-xl p-6 shadow-lg border border-border"
            >
              <div className="flex items-center mb-4">
                <div
                  className={`w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold ${
                    lang === 'ar' ? 'ml-4' : 'mr-4'
                  }`}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              <div className="flex mb-4">{renderStars(testimonial.rating)}</div>

              <blockquote className="text-muted-foreground italic">
                "{testimonial.content}"
              </blockquote>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {t('testimonials.trust.title', 'Why Trust Us')}
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-foreground mb-2">
                {t('testimonials.trust.verified.title', 'Verified Profiles')}
              </h4>
              <p className="text-muted-foreground">
                {t(
                  'testimonials.trust.verified.description',
                  'All craftsmen are verified and background-checked for your safety'
                )}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-foreground mb-2">
                {t('testimonials.trust.secure.title', 'Secure Payments')}
              </h4>
              <p className="text-muted-foreground">
                {t(
                  'testimonials.trust.secure.description',
                  'Your payments are protected with bank-level security'
                )}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-accent-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-foreground mb-2">
                {t('testimonials.trust.support.title', '24/7 Support')}
              </h4>
              <p className="text-muted-foreground">
                {t(
                  'testimonials.trust.support.description',
                  'Our support team is always here to help you'
                )}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TestimonialsSection;
