'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Quote, Pagination } from '@/app/types/jobs';
import { quotesService } from '@/app/services/jobs';
import Container from '@/app/components/ui/container';
import Button from '@/app/components/ui/button';
import PaginationComponent from '@/app/components/ui/pagination-component';
import { useSession } from 'next-auth/react';

interface QuotesPageState {
  quotes: Quote[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  statusFilter: string;
}

const QuotesPage = () => {
  const { data: session } = useSession();

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

        setState((prev) => ({
          ...prev,
          quotes: response.data,
          pagination: response.pagination,
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

  const getStatusBadge = useCallback((status: string) => {
    const statusClasses = {
      submitted:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      accepted:
        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusClasses[status as keyof typeof statusClasses] ||
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}
      >
        {status === 'submitted'
          ? 'Submitted'
          : status === 'accepted'
          ? 'Accepted'
          : status === 'rejected'
          ? 'Rejected'
          : status}
      </span>
    );
  }, []);

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: 'All Statuses' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'accepted', label: 'Accepted' },
      { value: 'rejected', label: 'Rejected' },
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
      <Container>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded-xl w-1/3"></div>
          <div className="h-6 bg-muted rounded-xl w-1/2"></div>
          <div className="h-12 bg-muted rounded-xl w-64"></div>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-6 border border-border space-y-4"
            >
              <div className="flex justify-between">
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
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          My Quotes
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Track all your submitted quotes and their status
        </p>
      </div>

      {/* Status Filter */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">
          Filter by Status:
        </label>
        <select
          value={state.statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="px-4 py-3 border border-border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm hover:shadow-md transition-shadow"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error State */}
      {state.error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <svg
              className="w-5 h-5 text-destructive"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-destructive font-medium">{state.error}</p>
          </div>
          <Button
            onClick={() =>
              fetchQuotes(state.pagination.currentPage, state.statusFilter)
            }
            variant="outline"
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Quotes List */}
      {state.quotes.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border max-w-md mx-auto">
            <svg
              className="w-16 h-16 text-muted-foreground mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No quotes found
            </h3>
            <p className="text-muted-foreground mb-4">
              {state.statusFilter !== 'all'
                ? `No quotes with status "${state.statusFilter}"`
                : 'Start browsing jobs and submit your first quote!'}
            </p>
            <Button
              onClick={() =>
                fetchQuotes(state.pagination.currentPage, state.statusFilter)
              }
              size="lg"
            >
              Refresh Quotes
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {state.quotes.map((quote) => (
            <div
              key={quote._id}
              className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Job: {quote.job.title}
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    Client: {quote.job.client.name}
                  </p>
                  {quote.job.client.rating && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <svg
                        className="w-4 h-4 mr-1 text-warning"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {quote.job.client.rating.toFixed(1)} (
                      {quote.job.client.reviewCount || 0} reviews)
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {getStatusBadge(quote.status)}
                  <div className="flex items-center mt-3">
                    <svg
                      className="w-5 h-5 mr-2 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    <span className="text-xl font-bold text-foreground">
                      {quote.price.toLocaleString()} EGP
                    </span>
                  </div>
                </div>
              </div>

              {quote.notes && (
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Additional Notes:
                  </h4>
                  <p className="text-sm text-muted-foreground">{quote.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center text-sm text-muted-foreground">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6"
                    />
                  </svg>
                  Submitted {formatDate(quote.createdAt)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/jobs/${quote.job.id}`, '_blank')}
                >
                  View Job
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
    </Container>
  );
};

export default QuotesPage;
