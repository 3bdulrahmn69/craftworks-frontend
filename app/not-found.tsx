'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaHome } from 'react-icons/fa';
import Container from './components/ui/container';
import Button from './components/ui/button';

export default function NotFound() {
  const t = useTranslations('pages.notFound');
  const locale = useLocale();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Container maxWidth="md" className="text-center">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg">
          {/* 404 Illustration */}
          <div className="mb-6">
            <div className="mx-auto w-32 h-32 bg-muted/50 rounded-2xl flex items-center justify-center">
              <div className="text-6xl md:text-7xl font-bold text-red-400/50">
                404
              </div>
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
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button
              onClick={() => router.back()}
              size="lg"
              className="w-full sm:w-auto"
              aria-label={t('goBack')}
            >
              <FaArrowLeft
                className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
              />
              {t('goBack')}
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
        </div>
      </Container>
    </div>
  );
}
