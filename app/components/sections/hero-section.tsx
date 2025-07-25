import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Button from '../ui/button';
import Container from '@/app/components/ui/container';
import { CiUser, CiCircleCheck, CiClock1 } from 'react-icons/ci';
import { memo } from 'react';

const HeroSection = memo(function HeroSection() {
  const t = useTranslations('homepage sections.hero section');
  const locale = useLocale();

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-10 z-0">
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] md:w-[500px] md:h-[500px] bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-secondary rounded-full blur-2xl" />
      </div>
      <Container>
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
          {/* Content */}
          <div className="flex flex-col items-center lg:items-start justify-center space-y-8 w-full text-center lg:text-left">
            <div className="w-full">
              <h1
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-2 ${
                  locale === 'ar' ? 'text-right' : 'text-left'
                }
                `}
              >
                {t('headline')}
              </h1>
              {/* Accent bar */}
              <div className="h-1 w-16 sm:w-20 bg-primary rounded-full mb-6 mx-auto lg:mx-0" />
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium mb-8">
                {t('subheadline')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none mx-auto lg:mx-0">
              <Link href="/auth/register?role=client" className="flex-1">
                <Button
                  variant="primary"
                  size="lg"
                  className="text-lg px-8 py-4 w-full shadow-md hover:scale-[1.03] transition-transform font-semibold"
                >
                  {t('findCraftsman')}
                </Button>
              </Link>
              <Link href="/auth/register?role=craftsman" className="flex-1">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 w-full shadow-md hover:scale-[1.03] transition-transform font-semibold"
                >
                  {t('joinAsCraftsman')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Element */}
          <div className="flex justify-center lg:justify-end w-full mb-10 lg:mb-0">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md -mt-2 md:mt-0">
              <div className="bg-card rounded-2xl shadow-2xl p-6 md:p-8 border border-border translate-y-0 md:translate-y-[-24px] rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <CiUser className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">
                        {t('sampleName')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t('sampleRole')}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t('sampleDesc')}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary font-semibold">
                      {t('sampleRate')}
                    </span>
                    <Button size="sm" variant="outline">
                      {t('contact')}
                    </Button>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-3 -right-3 md:-top-3 md:-right-6 bg-success text-success-foreground rounded-full p-2 md:p-3 shadow-lg">
                <CiCircleCheck size={24} />
              </div>
              <div className="absolute bottom-2 -left-3 md:bottom-3 md:-left-6 bg-warning text-warning-foreground rounded-full p-2 md:p-3 shadow-lg">
                <CiClock1 size={24} />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
});

export default HeroSection;
