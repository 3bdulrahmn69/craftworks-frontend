import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Job, Pagination, Service } from '@/app/types/jobs';
import { jobsService } from '@/app/services/jobs';
import servicesAPI from '@/app/services/services';

interface UseJobsProps {
  jobsPerPage?: number;
}

interface QuoteFormData {
  price: number;
  notes: string;
}

export const useJobs = ({ jobsPerPage = 9 }: UseJobsProps = {}) => {
  const { data: session } = useSession();
  const locale = useLocale();

  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  // Filter states
  const [selectedService, setSelectedService] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');

  // Applied filter states (only these trigger API calls)
  const [appliedService, setAppliedService] = useState<string>('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState<string>('');
  const [appliedState, setAppliedState] = useState<string>('');

  // Services
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Quote modal states
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // Fetch services
  const fetchServices = useCallback(async () => {
    try {
      setServicesLoading(true);
      const response = await servicesAPI.getAllServices(locale);
      if (response.data) {
        setServices(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setServicesLoading(false);
    }
  }, [locale]);

  // Fetch jobs
  const fetchJobs = useCallback(
    async (page: number = 1) => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        setError(null);

        const params = {
          page,
          limit: jobsPerPage,
          ...(appliedService && { service: appliedService }),
          ...(appliedState && { state: appliedState }),
        };

        // Use search endpoint if there's a search query, otherwise use regular jobs endpoint
        const response = appliedSearchQuery
          ? await jobsService.searchJobs(
              { ...params, q: appliedSearchQuery },
              session.accessToken
            )
          : await jobsService.getJobs(params, session.accessToken);

        if (response.data) {
          // Filter only "Posted" jobs that craftsmen can apply to
          console.log('Fetched jobs:', response);

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
    [
      session?.accessToken,
      appliedService,
      appliedState,
      appliedSearchQuery,
      jobsPerPage,
    ]
  );

  // Effects
  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Actions
  const refreshJobs = useCallback(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  const handleSearch = useCallback(() => {
    // Apply current filter values to trigger the search
    setAppliedService(selectedService);
    setAppliedState(selectedState);
    setAppliedSearchQuery(searchQuery);
    // fetchJobs will be called automatically due to dependency changes
  }, [selectedService, selectedState, searchQuery]);

  const handleServiceChange = useCallback((serviceId: string) => {
    setSelectedService(serviceId);
  }, []);

  const handleStateChange = useCallback((state: string) => {
    setSelectedState(state);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedService('');
    setSelectedState('');
    setSearchQuery('');
    setAppliedService('');
    setAppliedState('');
    setAppliedSearchQuery('');
  }, []);

  // Quote modal actions
  const openQuoteModal = useCallback((job: Job) => {
    setSelectedJob(job);
    setShowQuoteModal(true);
  }, []);

  const closeQuoteModal = useCallback(() => {
    setShowQuoteModal(false);
    setSelectedJob(null);
  }, []);

  const submitQuote = useCallback(
    async (quoteData: QuoteFormData) => {
      if (!session?.accessToken || !selectedJob) return;

      try {
        setSubmittingQuote(true);
        const response = await jobsService.submitQuote(
          selectedJob._id,
          {
            price: quoteData.price,
            notes: quoteData.notes || undefined,
          },
          session.accessToken
        );

        // Handle the 201 status code response structure you provided
        if (response.data && response.data._id) {
          // Success case - response contains the created quote
          closeQuoteModal();
          refreshJobs();
          return; // Success, let the component handle the toast
        } else if (response.success) {
          // Legacy success handling
          closeQuoteModal();
          refreshJobs();
          return;
        } else {
          throw new Error(response.message || 'Failed to submit quote');
        }
      } catch (err: any) {
        throw new Error(
          err.message || 'An error occurred while submitting quote'
        );
      } finally {
        setSubmittingQuote(false);
      }
    },
    [session?.accessToken, selectedJob, closeQuoteModal, refreshJobs]
  );

  // Computed values
  const hasActiveFilters = Boolean(
    appliedService || appliedState || appliedSearchQuery
  );
  const hasUnappliedChanges =
    selectedService !== appliedService ||
    selectedState !== appliedState ||
    searchQuery !== appliedSearchQuery;
  const isUserApplied = useCallback(
    (job: Job) =>
      job.appliedCraftsmen?.includes(session?.user?.id || '') || false,
    [session?.user?.id]
  );

  return {
    // Data
    jobs,
    loading,
    error,
    pagination,
    services,
    servicesLoading,

    // Filter states
    selectedService,
    selectedState,
    searchQuery,
    hasActiveFilters,
    hasUnappliedChanges,

    // Quote modal states
    showQuoteModal,
    selectedJob,
    submittingQuote,

    // Actions
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

    // Utilities
    isUserApplied,
  };
};
