import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import Container from '../ui/Container';

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const clientSteps = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      title: t('howItWorks.client.step1.title', 'Post Job'),
      description: t(
        'howItWorks.client.step1.description',
        'Describe your project and requirements'
      ),
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      title: t('howItWorks.client.step2.title', 'Receive Proposals'),
      description: t(
        'howItWorks.client.step2.description',
        'Get quotes from qualified craftsmen'
      ),
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: t('howItWorks.client.step3.title', 'Hire'),
      description: t(
        'howItWorks.client.step3.description',
        'Choose the best craftsman for your project'
      ),
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      title: t('howItWorks.client.step4.title', 'Pay Securely'),
      description: t(
        'howItWorks.client.step4.description',
        'Complete payment through our secure platform'
      ),
    },
  ];

  const craftsmanSteps = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      title: t('howItWorks.craftsman.step1.title', 'Create Profile'),
      description: t(
        'howItWorks.craftsman.step1.description',
        'Showcase your skills and experience'
      ),
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
          />
        </svg>
      ),
      title: t('howItWorks.craftsman.step2.title', 'Apply to Jobs'),
      description: t(
        'howItWorks.craftsman.step2.description',
        'Browse and bid on relevant projects'
      ),
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: t('howItWorks.craftsman.step3.title', 'Get Hired'),
      description: t(
        'howItWorks.craftsman.step3.description',
        'Win projects and start working'
      ),
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
      title: t('howItWorks.craftsman.step4.title', 'Earn'),
      description: t(
        'howItWorks.craftsman.step4.description',
        'Get paid for your completed work'
      ),
    },
  ];

  return (
    <section className="py-20 bg-background">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('howItWorks.title', 'How It Works')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t(
              'howItWorks.subtitle',
              'Simple steps to connect craftsmen with clients. Whether you need work done or want to offer your services, our platform makes it easy.'
            )}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* For Clients */}
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {t('howItWorks.forClients', 'For Clients')}
              </h3>
              <p className="text-muted-foreground">
                {t(
                  'howItWorks.forClientsSubtitle',
                  'Find the perfect craftsman for your project'
                )}
              </p>
            </div>

            <div className="space-y-6">
              {clientSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {step.title}
                    </h4>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Craftsmen */}
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {t('howItWorks.forCraftsmen', 'For Craftsmen')}
              </h3>
              <p className="text-muted-foreground">
                {t(
                  'howItWorks.forCraftsmenSubtitle',
                  'Showcase your skills and find new opportunities'
                )}
              </p>
            </div>

            <div className="space-y-6">
              {craftsmanSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-success/10 rounded-full flex items-center justify-center text-success">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {step.title}
                    </h4>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            {t('howItWorks.learnMore', 'Learn More')}
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default HowItWorksSection;
