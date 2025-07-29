'use client';

import Container from '@/app/components/ui/container';
import PaginationComponent from '@/app/components/ui/pagination-component';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import JobCard from '@/app/components/jobs/job-card';
import JobFilters from '@/app/components/jobs/job-filters';
import EmptyState from '@/app/components/jobs/empty-state';
import { useJobs } from '@/app/hooks/useJobs';
import { HiExclamationCircle, HiBriefcase } from 'react-icons/hi';
import JobsModal from '@/app/components/jobs/jobs-modal';

const JobsPage = () => {
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
    showQuoteModal,
    selectedJob,
    submittingQuote,
    fetchJobs,
    refreshJobs,
    handleSearch,
    handleServiceChange,
    handleStateChange,
    handleSearchChange,
    resetFilters,
    openQuoteModal,
    closeQuoteModal,
    submitQuote,
    isUserApplied,
  } = useJobs({ jobsPerPage: 15 }); // Enhanced to 15 jobs per page

  if (loading) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Loading Available Jobs
            </h3>
            <p className="text-muted-foreground">
              Please wait while we fetch the latest job opportunities for you...
            </p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 max-w-7xl">
      <main role="main">
        {/* Enhanced Header Section */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center">
            <HiBriefcase className="inline-block mr-2 text-primary" />
            Available Jobs
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Explore the latest job opportunities tailored for you
          </p>
        </header>

        {/* Error Display */}
        {error && (
          <div
            className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 rounded-2xl mb-8 shadow-sm"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-center gap-3">
              <HiExclamationCircle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Error Loading Jobs</h4>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-4">
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
          <div className="lg:col-span-3">
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
                      onQuoteClick={openQuoteModal}
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

        {/* Quote Modal */}
        {showQuoteModal && selectedJob && (
          <JobsModal
            job={selectedJob}
            isOpen={showQuoteModal}
            onClose={closeQuoteModal}
            onSubmit={submitQuote}
            submittingQuote={submittingQuote}
          />
        )}
      </main>
    </Container>
  );
};

export default JobsPage;
