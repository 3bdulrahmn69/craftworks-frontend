'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Job, Pagination, Service } from '@/app/types/jobs';
import { jobsService } from '@/app/services/jobs';
import servicesAPI from '@/app/services/services';
import Container from '@/app/components/ui/container';
import Button from '@/app/components/ui/button';
import PaginationComponent from '@/app/components/ui/pagination-component';

interface QuoteFormData {
  price: number;
  notes: string;
}

const JobsPage = () => {
  const { data: session } = useSession();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [quoteForm, setQuoteForm] = useState<QuoteFormData>({
    price: 0,
    notes: '',
  });
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const jobsPerPage = 9;

  // Services/Categories state
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Fetch services for categories filter
  const fetchServices = useCallback(async () => {
    try {
      setServicesLoading(true);
      const response = await servicesAPI.getAllServices();
      if (response.data) {
        setServices(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  const fetchJobs = useCallback(
    async (page: number = 1) => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        setError(null);

        const params = {
          page,
          limit: jobsPerPage,
          ...(selectedCategory && { category: selectedCategory }),
        };

        const response = await jobsService.getJobs(params, session.accessToken);
        console.log('response', response);

        if (response.data) {
          // Filter only "Posted" jobs that craftsmen can apply to
          const availableJobs = response.data.filter(
            (job: Job) => job.status === 'Posted'
          );

          setJobs(availableJobs);

          if (response.pagination) {
            setPagination(response.pagination);
          }
        } else {
          setError(response.message || 'Failed to fetch jobs');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching jobs');
      } finally {
        setLoading(false);
      }
    },
    [session?.accessToken, selectedCategory, jobsPerPage]
  );

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Refresh jobs function
  const refreshJobs = useCallback(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  const handleQuoteSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!session?.accessToken || !selectedJob) return;

      try {
        setSubmittingQuote(true);
        const response = await jobsService.submitQuote(
          selectedJob._id,
          {
            price: quoteForm.price,
            notes: quoteForm.notes || undefined,
          },
          session.accessToken
        );

        if (response.success) {
          alert('Quote submitted successfully!');
          setShowQuoteModal(false);
          setQuoteForm({ price: 0, notes: '' });
          setSelectedJob(null);
          // Refresh jobs to update applied status
          refreshJobs();
        } else {
          alert(response.message || 'Failed to submit quote');
        }
      } catch (err: any) {
        alert(err.message || 'An error occurred while submitting quote');
      } finally {
        setSubmittingQuote(false);
      }
    },
    [session?.accessToken, selectedJob, quoteForm, refreshJobs]
  );

  const openQuoteModal = useCallback((job: Job) => {
    setSelectedJob(job);
    setShowQuoteModal(true);
  }, []);

  const closeQuoteModal = useCallback(() => {
    setShowQuoteModal(false);
    setSelectedJob(null);
    setQuoteForm({ price: 0, notes: '' });
  }, []);

  const handleCategoryChange = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      fetchJobs(1);
    },
    [fetchJobs]
  );

  // Remove the filteredJobs useMemo since we're filtering on server side

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Loading jobs...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Available Jobs
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Browse and apply to jobs that match your skills
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 rounded-xl mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Service Filter */}
      <div className="mb-8">
        <label
          htmlFor="category-select"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Filter by Service:
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="px-4 py-3 border border-border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm hover:shadow-md transition-shadow"
          disabled={servicesLoading}
        >
          <option value="">All Services</option>
          {services.map((service) => (
            <option key={service._id} value={service.name}>
              {service.name}
            </option>
          ))}
        </select>
        {servicesLoading && (
          <p className="text-sm text-muted-foreground mt-2">
            Loading services...
          </p>
        )}
      </div>

      {jobs.length === 0 ? (
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
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6"
              />
            </svg>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {selectedCategory
                ? `No jobs found in ${selectedCategory}`
                : 'No jobs available at the moment'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Check back later for new opportunities
            </p>
            <Button onClick={refreshJobs} size="lg">
              Refresh Jobs
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 whitespace-nowrap ml-2">
                  {job.category}
                </span>
              </div>

              <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                {job.description}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-muted-foreground">
                  <svg
                    className="w-4 h-4 mr-3 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="truncate">{job.address}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <svg
                    className="w-4 h-4 mr-3 text-primary"
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
                  Payment: {job.paymentType}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <svg
                    className="w-4 h-4 mr-3 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>

              <Button
                onClick={() => openQuoteModal(job)}
                className="w-full"
                disabled={job.appliedCraftsmen?.includes(
                  session?.user?.id || ''
                )}
                variant={
                  job.appliedCraftsmen?.includes(session?.user?.id || '')
                    ? 'outline'
                    : 'primary'
                }
              >
                {job.appliedCraftsmen?.includes(session?.user?.id || '')
                  ? 'Applied'
                  : 'Submit Quote'}
              </Button>
            </div>
          ))}
        </div>
      )}

      {pagination && (
        <PaginationComponent
          pagination={pagination}
          onPageChange={(page) => {
            fetchJobs(page);
          }}
          isLoading={loading}
        />
      )}

      {/* Quote Modal */}
      {showQuoteModal && selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl max-w-md w-full shadow-2xl border border-border animate-fadeIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Submit Quote
                </h2>
                <button
                  onClick={closeQuoteModal}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6 p-4 bg-muted rounded-xl">
                <h3 className="font-medium text-foreground mb-2">
                  {selectedJob.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {selectedJob.description}
                </p>
              </div>

              <form onSubmit={handleQuoteSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="quote-price"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Quote Price (EGP) *
                  </label>
                  <input
                    type="number"
                    id="quote-price"
                    required
                    min="1"
                    value={quoteForm.price || ''}
                    onChange={(e) =>
                      setQuoteForm((prev) => ({
                        ...prev,
                        price: Number(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Enter your quote price"
                  />
                </div>

                <div>
                  <label
                    htmlFor="quote-notes"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="quote-notes"
                    rows={4}
                    value={quoteForm.notes}
                    onChange={(e) =>
                      setQuoteForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                    placeholder="Any additional details about your quote..."
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeQuoteModal}
                    className="flex-1"
                    disabled={submittingQuote}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingQuote || !quoteForm.price}
                    className="flex-1"
                    isLoading={submittingQuote}
                    loadingText="Submitting..."
                  >
                    Submit Quote
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default JobsPage;
