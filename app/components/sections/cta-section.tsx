import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FaUsers, FaCog, FaCheckCircle } from 'react-icons/fa';
import Button from '../ui/button';
import Container from '@/app/components/ui/container';

const CTASection = () => {
  const t = useTranslations('homepage sections.cta section');

  const clientFeatureKeys = ['feature1', 'feature2', 'feature3'];
  const craftsmanFeatureKeys = ['feature1', 'feature2', 'feature3'];
  const statKeys = ['stat1', 'stat2', 'stat3'];

  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"></div>
      </div>

      <Container className="relative z-10">
        <div className="text-center space-y-8 mb-16">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              {t('title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('description')}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* For Clients */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <FaUsers className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-card-foreground">
                  {t('forClients.title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('forClients.subtitle')}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {clientFeatureKeys.map((key, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-card-foreground">{t(`forClients.features.${key}`)}</span>
                </div>
              ))}
            </div>

            <Link href="/auth/register?role=client">
              <Button
                variant="primary"
                size="lg"
                className="w-full text-lg py-4"
              >
                {t('forClients.button')}
              </Button>
            </Link>
          </div>

          {/* For Craftsmen */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center">
                <FaCog className="w-8 h-8 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-card-foreground">
                  {t('forCraftsmen.title')}
                </h3>
                <p className="text-muted-foreground">{t('forCraftsmen.subtitle')}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {craftsmanFeatureKeys.map((key, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-card-foreground">{t(`forCraftsmen.features.${key}`)}</span>
                </div>
              ))}
            </div>

            <Link href="/auth/register?role=craftsman">
              <Button
                variant="outline"
                size="lg"
                className="w-full text-lg py-4"
              >
                {t('forCraftsmen.button')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-muted-foreground">
            {statKeys.map((key, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <FaCheckCircle className="w-5 h-5 text-success" />
                <span>{t(`stats.${key}.label`)}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            {t('footer')}
          </p>
        </div>
      </Container>
    </section>
  );
};

export default CTASection;
