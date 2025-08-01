import { useLocale, useTranslations } from 'next-intl';
import Container from '@/app/components/ui/container';
import {
  FaStar,
  FaRegStar,
  FaCheckCircle,
  FaLock,
  FaRegLifeRing,
} from 'react-icons/fa';

const TestimonialsSection = () => {
  const t = useTranslations('homepage sections.testimonials section');
  const locale = useLocale();

  const testimonials = [
    {
      name: t('testimonial1.name'),
      role: t('testimonial1.role'),
      content: t('testimonial1.content'),
      rating: 5,
      avatar: 'SA',
    },
    {
      name: t('testimonial2.name'),
      role: t('testimonial2.role'),
      content: t('testimonial2.content'),
      rating: 5,
      avatar: 'MH',
    },
    {
      name: t('testimonial3.name'),
      role: t('testimonial3.role'),
      content: t('testimonial3.content'),
      rating: 5,
      avatar: 'FA',
    },
  ];

  const stats = [
    {
      number: '10,000+',
      label: t('stats.completedProjects'),
    },
    {
      number: '5,000+',
      label: t('stats.happyClients'),
    },
    {
      number: '2,000+',
      label: t('stats.verifiedCraftsmen'),
    },
    {
      number: '4.8★',
      label: t('stats.averageRating'),
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) =>
      i < rating ? (
        <FaStar key={i} className="w-5 h-5 text-warning inline" />
      ) : (
        <FaRegStar key={i} className="w-5 h-5 text-gray-300 inline" />
      )
    );
  };

  return (
    <section className="py-20 bg-background">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('subtitle')}
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
                    locale === 'ar' ? 'ml-4' : 'mr-4'
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
                &quot;{testimonial.content}&quot;
              </blockquote>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {t('trust.title')}
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="w-8 h-8 text-success" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">
                {t('trust.verified.title')}
              </h4>
              <p className="text-muted-foreground">
                {t('trust.verified.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLock className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">
                {t('trust.secure.title')}
              </h4>
              <p className="text-muted-foreground">
                {t('trust.secure.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRegLifeRing className="w-8 h-8 text-accent-foreground" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">
                {t('trust.support.title')}
              </h4>
              <p className="text-muted-foreground">
                {t('trust.support.description')}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TestimonialsSection;
