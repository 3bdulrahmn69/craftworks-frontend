'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Container from './components/ui/container';
import Button from './components/ui/button';

export default function NotFound() {
  const t = useTranslations('pages.notFound');
  const router = useRouter();

  const helpfulLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQ' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Container maxWidth="md" className="text-center">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg">
          {/* 404 Illustration */}
          <div className="mb-6">
            <div className="mx-auto w-32 h-32 bg-muted/50 rounded-2xl flex items-center justify-center">
              <div className="text-6xl md:text-7xl font-bold text-muted-foreground/50">
                404
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
              {t('errorCode')}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('title')}
            </h1>

            <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
              {t('description')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button
              onClick={() => router.back()}
              size="lg"
              className="w-full sm:w-auto"
              aria-label={t('goBack')}
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {t('goBack')}
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

          {/* Helpful Links */}
          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {t('helpfulLinks')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {helpfulLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="p-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Search Suggestion */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {t('searchSuggestion')}
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
