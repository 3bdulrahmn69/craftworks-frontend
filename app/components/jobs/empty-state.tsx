'use client';

import { useLocale, useTranslations } from 'next-intl';
import Button from '@/app/components/ui/button';
import { HiBriefcase, HiRefresh, HiFilter } from 'react-icons/hi';

interface EmptyStateProps {
  hasFilters: boolean;
  onRefresh: () => void;
  onClearFilters?: () => void;
}

const EmptyState = ({
  hasFilters,
  onRefresh,
  onClearFilters,
}: EmptyStateProps) => {
  const locale = useLocale();
  const t = useTranslations('jobs.empty');

  return (
    <div className={`text-center py-20 ${locale === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="bg-card rounded-3xl shadow-lg p-12 border border-border max-w-lg mx-auto">
        <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
          <HiBriefcase className="w-12 h-12 text-primary" />
        </div>

        <h3
          className={`text-2xl font-bold text-foreground mb-4 ${
            locale === 'ar' ? 'text-right' : 'text-left'
          }`}
        >
          {hasFilters ? t('withFilters.title') : t('noFilters.title')}
        </h3>

        <p
          className={`text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed ${
            locale === 'ar' ? 'text-right' : 'text-left'
          }`}
        >
          {hasFilters ? t('withFilters.message') : t('noFilters.message')}
        </p>

        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center ${
            locale === 'ar' ? 'sm:flex-row-reverse' : ''
          }`}
        >
          <Button
            onClick={onRefresh}
            size="lg"
            className={`min-w-[140px] ${
              locale === 'ar' ? 'flex-row-reverse' : ''
            }`}
          >
            <HiRefresh
              className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
            />
            {t('buttons.refresh')}
          </Button>

          {hasFilters && onClearFilters && (
            <Button
              onClick={onClearFilters}
              variant="outline"
              size="lg"
              className={`min-w-[140px] ${
                locale === 'ar' ? 'flex-row-reverse' : ''
              }`}
            >
              <HiFilter
                className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
              />
              {t('buttons.clearFilters')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
