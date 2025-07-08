'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Container from '@/app/components/ui/container';

export default function Loading() {
  const t = useTranslations('pages.loading');
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSlowMessage(true);
    }, 5000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Container maxWidth="md" className="text-center">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg">
          {/* Content */}
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('title')}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
              {t('description')}
            </p>

            {/* Progress Dots */}
            <div
              className="flex justify-center space-x-2 mt-6"
              aria-hidden="true"
            >
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-primary rounded-full animate-pulse"
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className="w-2 h-2 bg-primary rounded-full animate-pulse"
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>

            {/* Slow loading message */}
            {showSlowMessage && (
              <div
                className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg animate-fadeIn"
                role="status"
                aria-live="polite"
              >
                <p className="text-sm text-warning-foreground">
                  {t('taking_longer')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('check_connection')}
                </p>
              </div>
            )}
          </div>

          {/* Accessibility */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {t('description')}
            {showSlowMessage && t('taking_longer')}
          </div>
        </div>
      </Container>
    </div>
  );
}
