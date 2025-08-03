'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { Job } from '@/app/types/jobs';
import { jobsService } from '@/app/services/jobs';
import { formatDate, formatAddress } from '@/app/utils/helpers';
import Container from '@/app/components/ui/container';
import Button from '@/app/components/ui/button';
import JobsModal from '@/app/components/jobs/jobs-modal';
import Map from '@/app/components/ui/map';
import ImageModal from '@/app/components/ui/image-modal';
import { toastService } from '@/app/utils/toast';
import {
  HiLocationMarker,
  HiCash,
  HiClock,
  HiUsers,
  HiCurrencyDollar,
  HiExclamationCircle,
  HiArrowLeft,
  HiPhotograph,
  HiCheckCircle,
  HiPencilAlt,
  HiTrash,
  HiUserGroup,
} from 'react-icons/hi';

const JobDetailsPage = () => {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('jobDetails');
  const tMyJobs = useTranslations('myJobs');
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  // Helper function to translate payment types
  const translatePaymentType = useCallback(
    (paymentType: string): string => {
      return tMyJobs(`paymentTypes.${paymentType}`) || paymentType;
    },
    [tMyJobs]
  );

  // Check if current user is the job owner
  const isJobOwner = job?.client === session?.user?.id;

  // Handle job deletion
  const handleDeleteJob = async () => {
    if (!session?.accessToken || !job?._id) return;

    try {
      setDeleting(true);
      const response = await jobsService.deleteJob(
        job._id,
        session.accessToken
      );

      if (response.success) {
        toastService.success(t('messages.jobDeleted'));
        router.push('/sc/my-jobs');
      } else {
        toastService.error(response.message || t('messages.deleteFailed'));
      }
    } catch (err: any) {
      toastService.error(err.message || t('messages.deleteFailed'));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle job editing
  const handleEditJob = () => {
    router.push(`/sc/job-manger?edit=${job?._id}`);
  };

  // View applications
  const handleViewApplications = () => {
    router.push(`/sc/jobs/${job?._id}/applications`);
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!session?.accessToken || !jobId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await jobsService.getJob(jobId, session.accessToken);

        if (response.success) {
          setJob(response.data);
        } else {
          setError(response.message || 'Failed to fetch job details');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [session?.accessToken, jobId]);

  const isApplied = job?.appliedCraftsmen?.includes(session?.user?.id || '');

  if (loading) {
    return (
      <Container>
        <div
          className={`flex justify-center items-center min-h-[400px] ${
            locale === 'ar' ? 'rtl' : 'ltr'
          }`}
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          <div
            className={`text-lg ${
              locale === 'ar' ? 'text-right' : 'text-left'
            }`}
          >
            {t('loading')}
          </div>
        </div>
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container>
        <div
          className={`text-center py-16 ${locale === 'ar' ? 'rtl' : 'ltr'}`}
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border max-w-md mx-auto">
            <HiExclamationCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h3
              className={`text-lg font-semibold text-foreground mb-2 ${
                locale === 'ar' ? 'text-right' : 'text-left'
              }`}
            >
              {error || t('notFound.title')}
            </h3>
            <p
              className={`text-muted-foreground mb-4 ${
                locale === 'ar' ? 'text-right' : 'text-left'
              }`}
            >
              {t('notFound.message')}
            </p>
            <Button onClick={() => router.back()}>
              {t('notFound.button')}
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className={`py-8 ${locale === 'ar' ? 'rtl' : 'ltr'}`}>
      <main role="main" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {/* Header with back button */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className={`mb-6 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            <HiArrowLeft
              className={`w-4 h-4 ${
                locale === 'ar' ? 'ml-2 rotate-180' : 'mr-2'
              }`}
            />
            {t('backButton')}
          </Button>

          <div
            className={`flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 ${
              locale === 'ar' ? 'lg:flex-row-reverse text-right' : 'text-left'
            }`}
          >
            <div className="flex-1">
              <h1
                className={`text-3xl md:text-4xl font-bold text-foreground mb-4 ${
                  locale === 'ar' ? 'text-right' : 'text-left'
                }`}
              >
                {job.title}
              </h1>
            </div>

            {/* Action buttons */}
            {job.status === 'Posted' && session?.user?.role === 'craftsman' && (
              <div
                className={`lg:flex-shrink-0 ${
                  locale === 'ar' ? 'lg:order-first' : ''
                }`}
              >
                <Button
                  onClick={() => setShowQuoteModal(true)}
                  disabled={isApplied}
                  variant={isApplied ? 'outline' : 'primary'}
                  size="lg"
                  className={`w-full lg:w-auto ${
                    locale === 'ar' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {isApplied ? (
                    <>
                      <HiCheckCircle
                        className={`w-5 h-5 ${
                          locale === 'ar' ? 'ml-2' : 'mr-2'
                        }`}
                      />
                      {t('buttons.applied')}
                    </>
                  ) : (
                    t('buttons.submitQuote')
                  )}
                </Button>
              </div>
            )}

            {/* Client management actions */}
            {isJobOwner && (
              <div
                className={`lg:flex-shrink-0 ${
                  locale === 'ar' ? 'lg:order-first' : ''
                }`}
              >
                <div
                  className={`flex flex-wrap gap-2 ${
                    locale === 'ar' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* View Applications */}
                  {(job.appliedCraftsmen?.length || 0) > 0 && (
                    <Button
                      onClick={handleViewApplications}
                      variant="outline"
                      size="sm"
                      className={`${locale === 'ar' ? 'flex-row-reverse' : ''}`}
                    >
                      <HiUserGroup
                        className={`w-4 h-4 ${
                          locale === 'ar' ? 'ml-2' : 'mr-2'
                        }`}
                      />
                      {t('buttons.viewApplications')} (
                      {job.appliedCraftsmen?.length || 0})
                    </Button>
                  )}

                  {/* Edit Job */}
                  {['Posted', 'Hired'].includes(job.status) && (
                    <Button
                      onClick={handleEditJob}
                      variant="outline"
                      size="sm"
                      className={`${locale === 'ar' ? 'flex-row-reverse' : ''}`}
                    >
                      <HiPencilAlt
                        className={`w-4 h-4 ${
                          locale === 'ar' ? 'ml-2' : 'mr-2'
                        }`}
                      />
                      {t('buttons.editJob')}
                    </Button>
                  )}

                  {/* Delete Job */}
                  {job.status === 'Posted' && (
                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="outline"
                      size="sm"
                      className={`border-destructive/30 text-destructive hover:bg-destructive/10 ${
                        locale === 'ar' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <HiTrash
                        className={`w-4 h-4 ${
                          locale === 'ar' ? 'ml-2' : 'mr-2'
                        }`}
                      />
                      {t('buttons.deleteJob')}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`grid gap-8 lg:grid-cols-3 ${
            locale === 'ar' ? 'rtl' : ''
          }`}
        >
          {/* Main content */}
          <div
            className={`lg:col-span-2 space-y-8 ${
              locale === 'ar' ? 'lg:order-2' : ''
            }`}
          >
            {/* Description */}
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
              <h2
                className={`text-xl font-semibold text-foreground mb-4 ${
                  locale === 'ar' ? 'text-right' : 'text-left'
                }`}
              >
                {t('sections.description')}
              </h2>
              <p
                className={`text-muted-foreground leading-relaxed whitespace-pre-wrap ${
                  locale === 'ar' ? 'text-right' : 'text-left'
                }`}
              >
                {job.description}
              </p>
            </div>

            {/* Photos */}
            {job.photos && job.photos.length > 0 && (
              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <h2
                  className={`text-xl font-semibold text-foreground mb-4 flex items-center ${
                    locale === 'ar'
                      ? 'flex-row-reverse justify-end'
                      : 'justify-start'
                  }`}
                >
                  <HiPhotograph
                    className={`w-5 h-5 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
                  />
                  {t('sections.photos')}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {job.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative rounded-lg overflow-hidden h-48 cursor-pointer group"
                      onClick={() => {
                        setSelectedImages(job.photos || []);
                        setSelectedImageIndex(index);
                        setShowImageModal(true);
                      }}
                    >
                      <Image
                        src={photo}
                        alt={`Job photo ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-20 rounded-full p-2">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Map */}
            {job.location && (
              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <h2
                  className={`text-xl font-semibold text-foreground mb-4 flex items-center ${
                    locale === 'ar'
                      ? 'flex-row-reverse justify-end'
                      : 'justify-start'
                  }`}
                >
                  <HiLocationMarker
                    className={`w-5 h-5 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
                  />
                  {t('sections.location')}
                </h2>
                <div
                  className="relative w-full overflow-hidden rounded-lg"
                  style={{ height: '300px' }}
                >
                  <Map
                    latitude={job.location.coordinates[1]}
                    longitude={job.location.coordinates[0]}
                    zoom={15}
                    height="100%"
                    markerTitle={job.title}
                    address={formatAddress(job.address)}
                    showPopup={true}
                    className="w-full h-full relative z-0"
                  />
                </div>
                <div
                  className={`mt-3 text-sm text-muted-foreground ${
                    locale === 'ar' ? 'text-right' : 'text-left'
                  }`}
                >
                  <p>{formatAddress(job.address)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className={`space-y-6 ${locale === 'ar' ? 'lg:order-1' : ''}`}>
            {/* Job Information */}
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
              <h2
                className={`text-xl font-semibold text-foreground mb-4 ${
                  locale === 'ar' ? 'text-right' : 'text-left'
                }`}
              >
                {t('sections.information')}
              </h2>
              <div className="space-y-4">
                <div
                  className={`flex items-center text-sm ${
                    locale === 'ar'
                      ? 'flex-row-reverse text-right'
                      : 'text-left'
                  }`}
                >
                  <HiLocationMarker
                    className={`w-4 h-4 text-primary flex-shrink-0 ${
                      locale === 'ar' ? 'ml-3' : 'mr-3'
                    }`}
                  />
                  <span className="text-muted-foreground">
                    {formatAddress(job.address)}
                  </span>
                </div>

                <div
                  className={`flex items-center text-sm ${
                    locale === 'ar'
                      ? 'flex-row-reverse text-right'
                      : 'text-left'
                  }`}
                >
                  <HiCash
                    className={`w-4 h-4 text-primary flex-shrink-0 ${
                      locale === 'ar' ? 'ml-3' : 'mr-3'
                    }`}
                  />
                  <span className="text-muted-foreground">
                    {t('info.payment')}: {translatePaymentType(job.paymentType)}
                  </span>
                </div>

                {job.jobPrice > 0 && (
                  <div
                    className={`flex items-center text-sm ${
                      locale === 'ar'
                        ? 'flex-row-reverse text-right'
                        : 'text-left'
                    }`}
                  >
                    <HiCurrencyDollar
                      className={`w-4 h-4 text-success flex-shrink-0 ${
                        locale === 'ar' ? 'ml-3' : 'mr-3'
                      }`}
                    />
                    <span className="text-foreground font-medium">
                      {t('info.budget')}: {job.jobPrice.toLocaleString()}{' '}
                      {t('info.egp')}
                    </span>
                  </div>
                )}

                <div
                  className={`flex items-center text-sm ${
                    locale === 'ar'
                      ? 'flex-row-reverse text-right'
                      : 'text-left'
                  }`}
                >
                  <HiClock
                    className={`w-4 h-4 text-primary flex-shrink-0 ${
                      locale === 'ar' ? 'ml-3' : 'mr-3'
                    }`}
                  />
                  <span className="text-muted-foreground">
                    {t('info.posted')} {formatDate(job.createdAt)}
                  </span>
                </div>

                {job.jobDate && (
                  <div
                    className={`flex items-center text-sm ${
                      locale === 'ar'
                        ? 'flex-row-reverse text-right'
                        : 'text-left'
                    }`}
                  >
                    <HiClock
                      className={`w-4 h-4 text-primary flex-shrink-0 ${
                        locale === 'ar' ? 'ml-3' : 'mr-3'
                      }`}
                    />
                    <span className="text-foreground font-medium">
                      {t('info.scheduledFor')} {formatDate(job.jobDate)}
                    </span>
                  </div>
                )}

                {job.appliedCraftsmen && job.appliedCraftsmen.length > 0 && (
                  <div
                    className={`flex items-center text-sm ${
                      locale === 'ar'
                        ? 'flex-row-reverse text-right'
                        : 'text-left'
                    }`}
                  >
                    <HiUsers
                      className={`w-4 h-4 text-amber-600 flex-shrink-0 ${
                        locale === 'ar' ? 'ml-3' : 'mr-3'
                      }`}
                    />
                    <span className="text-muted-foreground">
                      {job.appliedCraftsmen.length}{' '}
                      {job.appliedCraftsmen.length > 1
                        ? t('info.applicationsPlural')
                        : t('info.applications')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Apply */}
            {job.status === 'Posted' &&
              session?.user?.role === 'craftsman' &&
              !isApplied && (
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                  <h3
                    className={`font-semibold text-foreground mb-2 ${
                      locale === 'ar' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {t('quickApply.title')}
                  </h3>
                  <p
                    className={`text-sm text-muted-foreground mb-4 ${
                      locale === 'ar' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {t('quickApply.subtitle')}
                  </p>
                  <Button
                    onClick={() => setShowQuoteModal(true)}
                    className="w-full"
                  >
                    {t('quickApply.button')}
                  </Button>
                </div>
              )}
          </div>
        </div>

        {/* Quote Modal */}
        {showQuoteModal && (
          <JobsModal
            job={job}
            isOpen={showQuoteModal}
            onClose={() => setShowQuoteModal(false)}
            onSubmit={async (formData: { price: number; notes: string }) => {
              if (!session?.accessToken || !job) return;

              setSubmittingQuote(true);
              try {
                const response = await jobsService.submitQuote(
                  job._id,
                  {
                    price: formData.price,
                    notes: formData.notes || undefined,
                  },
                  session.accessToken
                );

                // Handle the 201 status code response structure
                if (response.data && response.data._id) {
                  toastService.success(t('toast.quoteSuccess'));
                  setShowQuoteModal(false);
                  // Refresh job data to update applied status
                  const updatedJobResponse = await jobsService.getJob(
                    jobId,
                    session.accessToken
                  );
                  if (updatedJobResponse.success) {
                    setJob(updatedJobResponse.data);
                  }
                } else if (response.success) {
                  // Legacy success handling
                  toastService.success(t('toast.quoteSuccess'));
                  setShowQuoteModal(false);
                  // Refresh job data to update applied status
                  const updatedJobResponse2 = await jobsService.getJob(
                    jobId,
                    session.accessToken
                  );
                  if (updatedJobResponse2.success) {
                    setJob(updatedJobResponse2.data);
                  }
                } else {
                  toastService.error(
                    response.message || t('toast.quoteFailed')
                  );
                }
              } catch (err: any) {
                toastService.error(err.message || t('toast.quoteError'));
              } finally {
                setSubmittingQuote(false);
              }
            }}
            submittingQuote={submittingQuote}
          />
        )}

        {/* Image Modal */}
        <ImageModal
          isOpen={showImageModal}
          images={selectedImages}
          initialIndex={selectedImageIndex}
          onClose={() => setShowImageModal(false)}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4 w-full">
              <div className="text-center">
                <HiTrash className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t('deleteModal.title')}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t('deleteModal.message')}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                  >
                    {t('deleteModal.cancel')}
                  </Button>
                  <Button
                    onClick={handleDeleteJob}
                    disabled={deleting}
                    className="bg-destructive hover:bg-destructive/80 text-destructive-foreground"
                  >
                    {deleting
                      ? t('deleteModal.deleting')
                      : t('deleteModal.confirm')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </Container>
  );
};

export default JobDetailsPage;
