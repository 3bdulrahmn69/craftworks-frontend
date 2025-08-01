'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Quote, Pagination } from '@/app/types/jobs';
import { quotesService } from '@/app/services/jobs';
import Container from '@/app/components/ui/container';
import Button from '@/app/components/ui/button';
import DropdownSelector from '@/app/components/ui/dropdown-selector';
import PaginationComponent from '@/app/components/ui/pagination-component';
import { useSession } from 'next-auth/react';
import { TiDocumentText } from 'react-icons/ti';
import {
  FiAlertCircle,
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiStar,
  FiRefreshCw,
  FiEye,
} from 'react-icons/fi';

interface QuotesPageState {
  quotes: Quote[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  statusFilter: string;
}

const QuotesPage = () => {
  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations('quotes');

  const [state, setState] = useState<QuotesPageState>({
    quotes: [],
    loading: true,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
      hasNext: false,
      hasPrev: false,
    },
    statusFilter: 'all',
  });

  const fetchQuotes = useCallback(
    async (page: number = 1, status: string = 'all') => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
        });

        if (status !== 'all') {
          params.append('status', status);
        }

        const response = await quotesService.getMyQuotes(
          params.toString(),
          session?.accessToken
        );

        console.log('Fetched quotes:', response);

        setState((prev) => ({
          ...prev,
          quotes: response.data || [],
          pagination: {
            currentPage: response.pagination?.page || 1,
            totalPages: response.pagination?.totalPages || 1,
            totalItems: response.pagination?.totalItems || 0,
            itemsPerPage: response.pagination?.limit || 10,
            hasNext: response.pagination?.hasNextPage || false,
            hasPrev: response.pagination?.hasPrevPage || false,
          },
          loading: false,
        }));
      } catch (error) {
        console.error('Error fetching quotes:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to fetch quotes',
          loading: false,
        }));
      }
    },
    [session?.accessToken]
  );

  useEffect(() => {
    fetchQuotes(state.pagination.currentPage, state.statusFilter);
  }, [fetchQuotes, state.pagination.currentPage, state.statusFilter]);

  const handleStatusFilter = useCallback((status: string) => {
    setState((prev) => ({
      ...prev,
      statusFilter: status,
      pagination: { ...prev.pagination, currentPage: 1 },
    }));
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, currentPage: newPage },
    }));
  }, []);

  const getStatusBadge = useCallback(
    (status: string) => {
      const statusClasses = {
        submitted:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        accepted:
          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        rejected:
          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      };

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusClasses[status as keyof typeof statusClasses] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          {t(`filters.status.${status}`)}
        </span>
      );
    },
    [t]
  );

  const statusOptions = useMemo(
    () => [
      { value: 'submitted', label: 'submitted' },
      { value: 'accepted', label: 'accepted' },
      { value: 'rejected', label: 'rejected' },
    ],
    []
  );

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  if (state.loading && state.quotes.length === 0) {
    return (
      <Container className={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div
          className="animate-pulse space-y-6"
          role="status"
          aria-label={t('loading.message')}
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          <div className="h-10 bg-muted rounded-xl w-1/3"></div>
          <div className="h-6 bg-muted rounded-xl w-1/2"></div>
          <div className="h-12 bg-muted rounded-xl w-64"></div>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-6 border border-border space-y-4"
            >
              <div
                className={`flex justify-between ${
                  locale === 'ar' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-muted rounded-full w-20"></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </div>
            </div>
          ))}
          <span className="sr-only">Loading your quotes...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className={`py-8 ${locale === 'ar' ? 'rtl' : 'ltr'}`}>
      <main role="main" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center">
            <TiDocumentText
              className={`text-primary ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
            />
            {t('title')}
          </h1>
          <p
            className={`text-xl text-muted-foreground max-w-3xl ${
              locale === 'ar' ? 'text-right' : 'text-left'
            }`}
          >
            {t('subtitle')}
          </p>
        </header>

        {/* Status Filter */}
        <section className="mb-8" aria-labelledby="filter-heading">
          <h2 id="filter-heading" className="sr-only">
            {t('filters.heading')}
          </h2>
          <div className="w-64">
            <DropdownSelector
              id="status-filter"
              label={t('filters.statusLabel')}
              options={statusOptions.map((option) => ({
                id: option.value,
                value: option.value,
                label: t(`filters.status.${option.value}`),
              }))}
              value={state.statusFilter}
              onChange={handleStatusFilter}
              placeholder={t('filters.selectStatus')}
              className="w-full"
            />
          </div>
          <p id="filter-description" className="sr-only">
            {t('filters.description')}
          </p>
        </section>

        {/* Error State */}
        {state.error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <FiAlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-destructive font-medium">{state.error}</p>
            </div>
            <Button
              onClick={() =>
                fetchQuotes(state.pagination.currentPage, state.statusFilter)
              }
              variant="outline"
              className="mt-2"
            >
              {t('error.tryAgain')}
            </Button>
          </div>
        )}

        {/* Quotes List */}
        {state.quotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-card rounded-2xl shadow-lg p-8 border border-border max-w-md mx-auto">
              <FiFileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('emptyState.title')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {state.statusFilter !== 'all'
                  ? t('emptyState.filtered', {
                      status: t(`filters.status.${state.statusFilter}`),
                    })
                  : t('emptyState.noQuotes')}
              </p>
              <Button
                onClick={() =>
                  fetchQuotes(state.pagination.currentPage, state.statusFilter)
                }
                size="lg"
                className="flex items-center gap-2 mx-auto"
              >
                <FiRefreshCw className="w-4 h-4" />
                {t('emptyState.refresh')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {state.quotes.map((quote) => (
              <div
                key={quote._id}
                className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                <div
                  className={`flex items-start gap-4 mb-4 ${
                    locale === 'ar' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-lg font-semibold text-foreground mb-2 ${
                        locale === 'ar' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {quote.job && typeof quote.job === 'object'
                        ? quote.job.title
                        : t('quote.jobDeleted')}
                    </h3>
                    {quote.job &&
                    typeof quote.job === 'object' &&
                    quote.job.client ? (
                      <>
                        <p
                          className={`text-muted-foreground mb-2 ${
                            locale === 'ar' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {quote.job.client.fullName}
                        </p>
                        {quote.job.client.rating && (
                          <div
                            className={`flex items-center text-sm text-muted-foreground ${
                              locale === 'ar'
                                ? 'flex-row-reverse justify-end'
                                : ''
                            }`}
                          >
                            <FiStar
                              className={`w-4 h-4 text-warning fill-current ${
                                locale === 'ar' ? 'ml-1' : 'mr-1'
                              }`}
                            />
                            {quote.job.client.rating.toFixed(1)} (
                            {quote.job.client.ratingCount || 0}{' '}
                            {t('quote.reviews')})
                          </div>
                        )}
                      </>
                    ) : (
                      <p
                        className={`text-muted-foreground mb-2 ${
                          locale === 'ar' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {t('quote.clientUnavailable')}
                      </p>
                    )}
                  </div>
                  <div
                    className={`flex flex-col items-end gap-3 flex-shrink-0 ${
                      locale === 'ar' ? 'order-first items-start' : 'order-last'
                    }`}
                  >
                    {getStatusBadge(quote.status)}
                    <div
                      className={`flex items-center ${
                        locale === 'ar' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <FiDollarSign
                        className={`w-5 h-5 text-primary ${
                          locale === 'ar' ? 'ml-2' : 'mr-2'
                        }`}
                      />
                      <span className="text-xl font-bold text-foreground">
                        {quote.price.toLocaleString()} {t('quote.currency')}
                      </span>
                    </div>
                  </div>
                </div>

                {quote.notes && (
                  <div className="bg-muted rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      {t('quote.additionalNotes')}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {quote.notes}
                    </p>
                  </div>
                )}

                <div
                  className={`flex items-center justify-between pt-4 border-t border-border ${
                    locale === 'ar' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex items-center text-sm text-muted-foreground ${
                      locale === 'ar' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <FiCalendar
                      className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
                    />
                    {t('quote.submitted')} {formatDate(quote.createdAt)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (quote.job && typeof quote.job === 'object') {
                        window.open(`/jobs/${quote.job._id}`, '_blank');
                      }
                    }}
                    disabled={!quote.job || typeof quote.job !== 'object'}
                    className="flex items-center gap-2"
                  >
                    <FiEye className="w-4 h-4" />
                    {quote.job && typeof quote.job === 'object'
                      ? t('quote.viewJob')
                      : t('quote.jobUnavailable')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <PaginationComponent
          pagination={state.pagination}
          onPageChange={handlePageChange}
          isLoading={state.loading}
        />
      </main>
    </Container>
  );
};

export default QuotesPage;
