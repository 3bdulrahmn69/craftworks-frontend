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
import RecommendationsModal from '../../../components/jobs/recommendations-modal';
import { Job, Pagination } from '@/app/types/jobs';
import { jobsService } from '@/app/services/jobs';
import { toast } from 'react-toastify';
import { FaBriefcase, FaPlus } from 'react-icons/fa';
import MyJobCard from '../../../components/jobs/my-job-card';

const ClientJobsPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('myJobs');
  const isRTL = locale === 'ar';
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
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

  const openRecommendationsModal = (jobId: string, jobTitle: string) => {
    setRecommendationsModal({ isOpen: true, jobId, jobTitle });
  };

  const closeRecommendationsModal = () => {
    setRecommendationsModal({ isOpen: false, jobId: '', jobTitle: '' });
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
              <MyJobCard
                key={job._id}
                job={job}
                isRTL={isRTL}
                deleteLoading={deleteLoading}
                openRecommendationsModal={openRecommendationsModal}
                openDeleteModal={openDeleteModal}
                handleCancelJob={handleCancelJob}
                cancelLoading={cancelLoading}
              />
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
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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
