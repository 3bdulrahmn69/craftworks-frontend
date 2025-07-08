'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Container from './components/ui/container';
import Button from './components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('pages.error');

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
              <svg
                className="w-10 h-10 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
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
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {t('tryAgain')}
            </Button>

            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 text-lg rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border border-border bg-transparent hover:bg-accent w-full sm:w-auto"
              aria-label={t('goHome')}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {t('goHome')}
            </Link>
          </div>

          {/* Help Link */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Need help?{' '}
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
