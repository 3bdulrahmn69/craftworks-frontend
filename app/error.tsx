'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa';
import Container from '@/app/components/ui/container';
import Button from '@/app/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('pages.error');
  const locale = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const timestamp = new Date().toISOString();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Container maxWidth="md" className="text-center">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="w-10 h-10 text-destructive" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('title')}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
              {t('description')}
            </p>

            {/* Error Details */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left bg-muted/50 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  Technical Details
                </summary>
                <div className="mt-2 space-y-2 text-xs font-mono">
                  <div>
                    <strong>{t('errorCode')}:</strong>{' '}
                    {error.digest || 'Unknown'}
                  </div>
                  <div>
                    <strong>{t('timestamp')}:</strong> {timestamp}
                  </div>
                  <div>
                    <strong>Message:</strong> {error.message}
                  </div>
                </div>
              </details>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => reset()}
              size="lg"
              className="w-full sm:w-auto"
              aria-label={t('tryAgain')}
            >
              <FaRedo
                className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
              />
              {t('tryAgain')}
            </Button>

            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 text-lg rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border border-border bg-transparent hover:bg-accent w-full sm:w-auto"
              aria-label={t('goHome')}
            >
              <FaHome
                className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
              />
              {t('goHome')}
            </Link>
          </div>

          {/* Help Link */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {t('needHelp')}{' '}
              <Link
                href="/contact"
                className="text-primary hover:text-primary/80 underline"
                aria-label={t('reportIssue')}
              >
                {t('reportIssue')}
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
