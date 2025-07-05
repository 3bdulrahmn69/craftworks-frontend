import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import Button from '../ui/Button';
import Container from '../ui/Container';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-gradient-to-br from-background via-background to-primary/5">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                {t(
                  'hero.headline',
                  'Connect with Skilled Craftsmen Across Egypt'
                )}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t(
                  'hero.subheadline',
                  'Find trusted professionals for your projects or showcase your skills to potential clients. Join our growing community of craftsmen and clients.'
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth/register?role=client">
                <Button
                  variant="primary"
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  {t('hero.findCraftsman', 'Find a Craftsman')}
                </Button>
              </Link>
              <Link to="/auth/register?role=craftsman">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  {t('hero.joinAsCraftsman', 'Join as a Craftsman')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Element */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="bg-card rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300 border border-border">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-primary-foreground"
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
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">
                        Ahmed Hassan
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Electrician • 4.9★
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    "Professional electrical work with attention to detail.
                    Available for residential and commercial projects."
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary font-semibold">$50/hr</span>
                    <Button size="sm" variant="outline">
                      Contact
                    </Button>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-success text-success-foreground rounded-full p-3 shadow-lg">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-warning text-warning-foreground rounded-full p-3 shadow-lg">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;
