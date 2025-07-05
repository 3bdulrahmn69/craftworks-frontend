import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import Button from '../ui/Button';
import Container from '../ui/Container';

const CTASection = () => {
  const { t } = useTranslation();

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
              {t('cta.title', 'Ready to Transform Your Experience?')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('cta.subtitle', 'Join thousands of satisfied clients and skilled craftsmen who are already part of our growing community. Whether you need quality work done or want to showcase your expertise, we\'ve got you covered.')}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* For Clients */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-card-foreground">{t('cta.forClients.title', 'For Clients')}</h3>
                <p className="text-muted-foreground">{t('cta.forClients.subtitle', 'Find trusted professionals')}</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-card-foreground">{t('cta.forClients.feature1', 'Access verified craftsmen with ratings')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-card-foreground">{t('cta.forClients.feature2', 'Get quotes and compare prices')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-card-foreground">{t('cta.forClients.feature3', 'Secure payment and project tracking')}</span>
              </div>
            </div>

            <Link to="/auth/register?role=client">
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full text-lg py-4"
              >
                {t('cta.forClients.button', 'Find a Craftsman')}
              </Button>
            </Link>
          </div>

          {/* For Craftsmen */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-card-foreground">{t('cta.forCraftsmen.title', 'For Craftsmen')}</h3>
                <p className="text-muted-foreground">{t('cta.forCraftsmen.subtitle', 'Showcase your expertise')}</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-card-foreground">{t('cta.forCraftsmen.feature1', 'Create your professional profile')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-card-foreground">{t('cta.forCraftsmen.feature2', 'Connect with potential clients')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-card-foreground">{t('cta.forCraftsmen.feature3', 'Grow your business and reputation')}</span>
              </div>
            </div>

            <Link to="/auth/register?role=craftsman">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full text-lg py-4"
              >
                {t('cta.forCraftsmen.button', 'Join as Craftsman')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-muted-foreground">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t('cta.trust.verifiedCraftsmen', '1000+ Verified Craftsmen')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t('cta.trust.completedProjects', '5000+ Completed Projects')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t('cta.trust.averageRating', '4.8★ Average Rating')}</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {t('cta.trust.footer', 'Join our community today and experience the difference quality craftsmanship makes')}
          </p>
        </div>
      </Container>
    </section>
  );
};

export default CTASection;
