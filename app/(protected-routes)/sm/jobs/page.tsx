'use client';

import { useLocale, useTranslations } from 'next-intl';
import Container from '@/app/components/ui/container';
import PaginationComponent from '@/app/components/ui/pagination-component';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import JobCard from '../../../components/jobs/job-card';
import JobFilters from '../../../components/jobs/job-filters';
import EmptyState from '../../../components/jobs/empty-state';
import { useJobs } from '@/app/hooks/useJobs';
import { HiExclamationCircle, HiBriefcase } from 'react-icons/hi';

const JobsPage = () => {
  const locale = useLocale();
  const t = useTranslations('jobs');
  const {
    jobs,
    loading,
    error,
    pagination,
    services,
    servicesLoading,
    selectedService,
    selectedState,
    searchQuery,
    hasActiveFilters,
    hasUnappliedChanges,
    fetchJobs,
    refreshJobs,
    handleSearch,
    handleServiceChange,
    handleStateChange,
    handleSearchChange,
    resetFilters,
    isUserApplied,
  } = useJobs({ jobsPerPage: 15 });

  if (loading) {
    return (
      <Container className={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div
          className="flex flex-col items-center justify-center min-h-[60vh] space-y-4"
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          <LoadingSpinner size="lg" />
          <div
            className={`text-center ${
              locale === 'ar' ? 'text-right' : 'text-left'
            }`}
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('loading.title')}
            </h3>
            <p className="text-muted-foreground">{t('loading.message')}</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className={`py-8 max-w-7xl ${locale === 'ar' ? 'rtl' : 'ltr'}`}>
      <main role="main" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {/* Enhanced Header Section */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center">
            <HiBriefcase
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

        {/* Error Display */}
        {error && (
          <div
            className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 rounded-2xl mb-8 shadow-sm"
            role="alert"
            aria-live="polite"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <div
              className={`flex items-center gap-3 ${
                locale === 'ar' ? 'flex-row-reverse text-right' : 'text-left'
              }`}
            >
              <HiExclamationCircle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">{t('error.title')}</h4>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div
          className={`grid gap-8 lg:grid-cols-4 ${
            locale === 'ar' ? 'rtl' : ''
          }`}
        >
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <JobFilters
                searchQuery={searchQuery}
                selectedService={selectedService}
                selectedState={selectedState}
                services={services}
                servicesLoading={servicesLoading}
                hasActiveFilters={hasActiveFilters}
                hasUnappliedChanges={hasUnappliedChanges}
                onSearchChange={handleSearchChange}
                onServiceChange={handleServiceChange}
                onStateChange={handleStateChange}
                onSearch={handleSearch}
                onReset={resetFilters}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div
            className={`lg:col-span-3 ${locale === 'ar' ? 'lg:order-1' : ''}`}
          >
            {/* Jobs Grid - Single Column Layout */}
            {jobs.length === 0 ? (
              <EmptyState
                hasFilters={Boolean(hasActiveFilters)}
                onRefresh={refreshJobs}
                onClearFilters={hasActiveFilters ? resetFilters : undefined}
              />
            ) : (
              <div className="space-y-6">
                {/* Job Cards - Single Column */}
                <div className="space-y-6">
                  {jobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      isApplied={isUserApplied(job)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && (
                  <div className="mt-12">
                    <PaginationComponent
                      pagination={pagination}
                      onPageChange={(page) => fetchJobs(page)}
                      isLoading={loading}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </Container>
  );
};

export default JobsPage;
