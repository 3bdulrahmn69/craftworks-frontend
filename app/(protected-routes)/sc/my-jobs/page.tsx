'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Container from '@/app/components/ui/container';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import Button from '@/app/components/ui/button';
import PaginationComponent from '@/app/components/ui/pagination-component';
import Modal from '@/app/components/ui/modal';
import RecommendationsModal from './components/recommendations-modal';
import JobOptionsDropdown from './components/job-options-dropdown';
import { Job, Pagination } from '@/app/types/jobs';
import { jobsService } from '@/app/services/jobs';
import { toast } from 'react-toastify';
import {
  FaBriefcase,
  FaPlus,
  FaMapMarkerAlt,
  FaDollarSign,
  FaCalendarAlt,
  FaUsers,
  FaClock,
  FaEye,
} from 'react-icons/fa';

const ClientJobsPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('myJobs');
  const isRTL = locale === 'ar';
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [recommendationsModal, setRecommendationsModal] = useState<{
    isOpen: boolean;
    jobId: string;
    jobTitle: string;
  }>({
    isOpen: false,
    jobId: '',
    jobTitle: '',
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    jobId: string;
    jobTitle: string;
  }>({
    isOpen: false,
    jobId: '',
    jobTitle: '',
  });

  const fetchJobs = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch jobs posted by the client
      const response = await jobsService.getMyJobs(
        {
          page: currentPage,
          limit: 10,
        },
        session.accessToken
      );

      if (response.data) {
        setJobs(response.data);
        setPagination(response.pagination || null);
      } else {
        setError(response.message || t('loading.message'));
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching jobs');
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, currentPage, t]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteJob = async () => {
    if (!session?.accessToken || !deleteModal.jobId) return;

    try {
      setDeleteLoading(deleteModal.jobId);
      const response = await jobsService.deleteJob(
        deleteModal.jobId,
        session.accessToken
      );

      if (response.success) {
        toast.success('Job deleted successfully!');
        // Remove the job from the list
        setJobs((prev) => prev.filter((job) => job._id !== deleteModal.jobId));
        setDeleteModal({ isOpen: false, jobId: '', jobTitle: '' });
      } else {
        throw new Error(response.message || 'Failed to delete job');
      }
    } catch (err: any) {
      console.error('Failed to delete job:', err);
      toast.error(err.message || 'Failed to delete job');
    } finally {
      setDeleteLoading(null);
    }
  };

  const openDeleteModal = (jobId: string, jobTitle: string) => {
    setDeleteModal({ isOpen: true, jobId, jobTitle });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, jobId: '', jobTitle: '' });
  };

  // Job action handlers
  const handleViewJob = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  const handleEditJob = (jobId: string) => {
    router.push(`/sc/create-job?edit=${jobId}`);
  };

  const handleCancelJob = async (jobId: string) => {
    if (!session?.accessToken) return;

    try {
      setCancelLoading(jobId);
      const response = await jobsService.cancelJob(jobId, session.accessToken);

      if (response.success) {
        toast.success('Job cancelled successfully!');
        // Refresh the jobs list
        fetchJobs();
      } else {
        throw new Error(response.message || 'Failed to cancel job');
      }
    } catch (err: any) {
      console.error('Failed to cancel job:', err);
      toast.error(err.message || 'Failed to cancel job');
    } finally {
      setCancelLoading(null);
    }
  };

  const handleViewApplications = (jobId: string) => {
    router.push(`/sc/jobs/${jobId}/applications`);
  };

  const openRecommendationsModal = (jobId: string, jobTitle: string) => {
    setRecommendationsModal({ isOpen: true, jobId, jobTitle });
  };

  const closeRecommendationsModal = () => {
    setRecommendationsModal({ isOpen: false, jobId: '', jobTitle: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Posted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Hired':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    return t(`status.${status}`) || status;
  };

  const getPaymentTypeText = (paymentType: string) => {
    return t(`paymentTypes.${paymentType}`) || paymentType;
  };

  const formatAddress = (address: any) => {
    if (typeof address === 'string') return address;
    if (typeof address === 'object' && address) {
      return `${address.street}, ${address.city}, ${address.state}`;
    }
    return 'No address provided';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Container className={`${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-center">
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
    <Container className={`py-8 max-w-7xl ${isRTL ? 'rtl' : 'ltr'}`}>
      <main role="main">
        {/* Header Section */}
        <header
          className={`mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between ${
            isRTL ? 'sm:flex-row-reverse' : ''
          }`}
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center">
              <FaBriefcase
                className={`inline-block text-primary ${
                  isRTL ? 'ml-3' : 'mr-3'
                }`}
              />
              {t('title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              {t('subtitle')}
            </p>
          </div>

          <Button
            onClick={() => router.push('/sc/services')}
            className="mt-4 sm:mt-0"
          >
            <FaPlus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('buttons.createNew')}
          </Button>
        </header>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <FaBriefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('empty.title')}
            </h3>
            <p className="text-muted-foreground mb-6">{t('empty.message')}</p>
            <Button onClick={() => router.push('/sc/services')}>
              <FaPlus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('buttons.createFirst')}
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className={`bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 overflow-hidden group ${
                  isRTL ? 'rtl' : 'ltr'
                }`}
              >
                {/* Card Header with Gradient */}
                <div className="relative bg-gradient-to-r from-primary/5 via-primary/3 to-transparent p-6 border-b border-border/30">
                  <div
                    className={`flex items-start justify-between ${
                      isRTL ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div
                        className={`flex items-center gap-3 mb-3 ${
                          isRTL ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                          <FaBriefcase className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 ${
                              isRTL ? 'text-right' : 'text-left'
                            }`}
                          >
                            {job.title}
                          </h3>
                          {job.service && (
                            <p className="text-sm text-muted-foreground font-medium">
                              {job.service.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <p
                        className={`text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4 ${
                          isRTL ? 'text-right' : 'text-left'
                        }`}
                      >
                        {job.description}
                      </p>
                    </div>

                    {/* Status Badge and Options */}
                    <div
                      className={`flex items-center gap-3 ${
                        isRTL ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {getStatusText(job.status)}
                      </span>
                      <JobOptionsDropdown
                        job={job}
                        isRTL={isRTL}
                        onEdit={() => handleEditJob(job._id)}
                        onDelete={() => openDeleteModal(job._id, job.title)}
                        onCancel={() => handleCancelJob(job._id)}
                        deleteLoading={deleteLoading === job._id}
                        cancelLoading={cancelLoading === job._id}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Body with Enhanced Info Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Location */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <FaMapMarkerAlt className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {t('jobCard.location')}
                        </p>
                        <p className="text-sm font-semibold text-foreground truncate">
                          {formatAddress(job.address)}
                        </p>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <FaDollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {t('jobCard.payment')}
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {job.jobPrice} {t('jobCard.egp')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getPaymentTypeText(job.paymentType)}
                        </p>
                      </div>
                    </div>

                    {/* Posted Date */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <FaCalendarAlt className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {t('jobCard.posted')}
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {formatDate(job.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Applications/Status */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        {job.status === 'Posted' ? (
                          <FaClock className="w-4 h-4 text-orange-600" />
                        ) : (
                          <FaUsers className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {job.status === 'Posted'
                            ? 'Status'
                            : t('jobCard.applications')}
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {job.status === 'Posted'
                            ? t('jobCard.openStatus')
                            : `${job.appliedCraftsmen?.length || 0} ${t(
                                'jobCard.applications'
                              )}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons for Applications and Recommendations */}
                  {job.status === 'Posted' && (
                    <div
                      className={`flex flex-col sm:flex-row gap-3 ${
                        isRTL ? 'sm:flex-row-reverse' : ''
                      }`}
                    >
                      {/* View Job Button */}
                      <Button
                        onClick={() => handleViewJob(job._id)}
                        className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 ${
                          isRTL ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <FaEye
                          className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`}
                        />
                        {t('buttons.viewJob')}
                      </Button>

                      {/* View Applications Button */}
                      {job.appliedCraftsmen &&
                        job.appliedCraftsmen.length > 0 && (
                          <Button
                            onClick={() => handleViewApplications(job._id)}
                            className={`flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 ${
                              isRTL ? 'flex-row-reverse' : ''
                            }`}
                          >
                            <FaUsers
                              className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`}
                            />
                            {t('buttons.viewApplications')} (
                            {job.appliedCraftsmen.length})
                          </Button>
                        )}

                      {/* Get Recommendations Button */}
                      <Button
                        variant="outline"
                        onClick={() =>
                          openRecommendationsModal(job._id, job.title)
                        }
                        className={`flex-1 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 font-medium py-3 px-6 rounded-xl transition-all duration-200 ${
                          isRTL ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <FaUsers
                          className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`}
                        />
                        {t('buttons.getRecommendations')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <PaginationComponent
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          title={t('deleteModal.title')}
        >
          <div className={`py-4 ${isRTL ? 'rtl' : 'ltr'}`}>
            <p
              className={`text-muted-foreground ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              {t('deleteModal.message')}{' '}
              <strong>&quot;{deleteModal.jobTitle}&quot;</strong>?
            </p>
            <p
              className={`text-muted-foreground mt-2 ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              {t('deleteModal.warning')}
            </p>

            <div
              className={`flex gap-2 mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Button
                variant="outline"
                onClick={closeDeleteModal}
                disabled={deleteLoading === deleteModal.jobId}
              >
                {t('buttons.cancel')}
              </Button>
              <Button
                onClick={handleDeleteJob}
                disabled={deleteLoading === deleteModal.jobId}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteLoading === deleteModal.jobId ? (
                  <>
                    <LoadingSpinner
                      size="sm"
                      className={`${isRTL ? 'ml-2' : 'mr-2'}`}
                    />
                    {t('buttons.deleting')}
                  </>
                ) : (
                  t('deleteModal.deleteButton')
                )}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Recommendations Modal */}
        <RecommendationsModal
          isOpen={recommendationsModal.isOpen}
          onClose={closeRecommendationsModal}
          jobId={recommendationsModal.jobId}
          jobTitle={recommendationsModal.jobTitle}
          accessToken={session?.accessToken || ''}
        />
      </main>
    </Container>
  );
};

export default ClientJobsPage;
