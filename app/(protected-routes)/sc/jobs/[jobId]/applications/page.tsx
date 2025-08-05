'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Container from '@/app/components/ui/container';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import Button from '@/app/components/ui/button';
import { jobsService } from '@/app/services/jobs';
import { messageService } from '@/app/services/messages';
import { JobApplication, Job } from '@/app/types/jobs';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaBriefcase,
  FaUser,
  FaDollarSign,
  FaStar,
  FaCheck,
  FaTimes,
  FaFileAlt,
  FaComments,
} from 'react-icons/fa';
import Link from 'next/link';

const JobApplicationsPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations('jobApplications');
  const jobId = params?.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobAndApplications = async () => {
      if (!jobId || !session?.accessToken) return;

      try {
        setLoading(true);
        setError(null);

        const [jobResponse, quotesResponse] = await Promise.all([
          jobsService.getJob(jobId, session.accessToken),
          jobsService.getJobQuotes(jobId, session.accessToken),
        ]);

        if (jobResponse.success && jobResponse.data) {
          setJob(jobResponse.data);
        } else {
          throw new Error('Failed to load job details');
        }

        if (quotesResponse.success && quotesResponse.data) {
          setApplications(quotesResponse.data);
        } else {
          throw new Error('Failed to load applications');
        }
      } catch (err: any) {
        console.error('Failed to fetch job and applications:', err);
        setError(err.message || 'Failed to load data');
        toast.error('Failed to load job applications');
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndApplications();
  }, [jobId, session?.accessToken]);

  const handleAcceptQuote = async (quoteId: string) => {
    if (!session?.accessToken) return;

    try {
      setActionLoading(quoteId);
      const response = await jobsService.acceptQuote(
        jobId,
        quoteId,
        session.accessToken
      );

      if (response.success) {
        toast.success('Quote accepted successfully!');
        router.refresh();
      } else {
        throw new Error(response.message || 'Failed to accept quote');
      }
    } catch (err: any) {
      console.error('Failed to accept quote:', err);
      toast.error(err.message || 'Failed to accept quote');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectQuote = async (quoteId: string) => {
    if (!session?.accessToken) return;

    try {
      setActionLoading(quoteId);
      const response = await jobsService.rejectQuote(
        jobId,
        quoteId,
        session.accessToken
      );

      if (response.success) {
        toast.success('Quote rejected successfully!');
        router.refresh();
      } else {
        throw new Error(response.message || 'Failed to reject quote');
      }
    } catch (err: any) {
      console.error('Failed to reject quote:', err);
      toast.error(err.message || 'Failed to reject quote');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartChat = async (
    craftsmanId: string,
    craftsmanName: string
  ) => {
    if (!session?.accessToken) return;

    try {
      setActionLoading(`chat-${craftsmanId}`);
      const response = await messageService.createChat(
        {
          craftsmanId: craftsmanId,
          jobId: jobId,
        },
        session.accessToken
      );

      if (response.success && response.data) {
        router.push(`/sc/messages?chatId=${response.data._id}`);
        toast.success(`Chat started with ${craftsmanName}`);
      } else {
        throw new Error(response.message || 'Failed to start chat');
      }
    } catch (err: any) {
      console.error('Failed to start chat:', err);
      toast.error(err.message || 'Failed to start chat');
    } finally {
      setActionLoading(null);
    }
  };

  // Component: Loading State
  const LoadingState = () => (
    <Container className={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] space-y-4"
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
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

  // Component: Error State
  const ErrorState = () => (
    <Container className={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] space-y-4"
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t('error.title')}
          </h3>
          <p className="text-muted-foreground mb-4">
            {error || t('error.jobNotFound')}
          </p>
          <Button onClick={() => router.back()}>{t('error.goBack')}</Button>
        </div>
      </div>
    </Container>
  );

  // Component: Job Header
  const JobHeader = () => (
    <header className="mb-6 sm:mb-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className={`mb-4 sm:mb-6 p-2 sm:p-3 hover:bg-primary/10 rounded-lg transition-all duration-200 flex items-center group`}
      >
        <FaArrowLeft
          className={`w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-200 ${
            locale === 'ar' ? 'ml-2 rotate-180' : 'mr-2'
          }`}
        />
        <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-200 text-sm sm:text-base">
          {t('header.backToJob')}
        </span>
      </Button>

      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-primary/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-primary/20 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary bg-clip-text text-transparent mb-4 flex items-center">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary via-primary/90 to-primary rounded-xl flex items-center justify-center shadow-lg ${
                  locale === 'ar' ? 'ml-3 sm:ml-4' : 'mr-3 sm:mr-4'
                }`}
              >
                <FaBriefcase className="text-primary-foreground w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="truncate">{job?.title}</span>
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-muted backdrop-blur-sm rounded-lg p-3 border border-primary/20 shadow-sm">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                  {t('header.status')}
                </div>
                <div
                  className={`font-semibold px-2 py-1 rounded-full text-xs sm:text-sm inline-block ${
                    job?.status === 'Posted'
                      ? 'bg-success/10 text-success border border-success/20'
                      : job?.status === 'Hired'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : job?.status === 'In Progress'
                      ? 'bg-warning/10 text-warning border border-warning/20'
                      : job?.status === 'Completed'
                      ? 'bg-success/10 text-success border border-success/20'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {job?.status}
                </div>
              </div>

              <div className="bg-muted backdrop-blur-sm rounded-lg p-3 border border-primary/20 shadow-sm">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                  {t('header.payment')}
                </div>
                <div className="font-semibold text-foreground text-sm">
                  {job?.paymentType}
                </div>
              </div>

              <div className="bg-muted backdrop-blur-sm rounded-lg p-3 border border-success/20 shadow-sm">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                  {t('header.price')}
                </div>
                <div className="font-bold text-lg bg-gradient-to-r from-success to-success bg-clip-text text-transparent">
                  ${job?.jobPrice}
                </div>
              </div>

              <div className="bg-muted backdrop-blur-sm rounded-lg p-3 border border-primary/20 shadow-sm">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                  {t('header.applicationsCount')}
                </div>
                <div className="font-bold text-lg text-primary">
                  {applications.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  // Component: Application Card
  const ApplicationCard = ({
    application,
  }: {
    application: JobApplication;
  }) => {
    const isDeclined = application.status === 'Declined';
    const isSubmitted = application.status === 'Submitted';

    return (
      <div className="bg-gradient-to-br from-card to-card/80 border border-border/50 hover:border-primary/30 rounded-xl p-5 sm:p-6 transition-all duration-300 hover:shadow-lg relative overflow-hidden group">
        {/* Status Ribbon - Top right corner */}
        {application.status !== 'Submitted' && (
          <div
            className={`absolute top-4 ${
              locale === 'ar' ? 'left-4' : 'right-4'
            } z-10`}
          >
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                application.status === 'Accepted'
                  ? 'bg-success/15 text-success border border-success/30'
                  : 'bg-destructive/15 text-destructive border border-destructive/30'
              }`}
            >
              {t(`application.status.${application.status.toLowerCase()}`)}
            </span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Craftsman Profile Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {application.craftsman.profilePicture ? (
                <Link href={`/users/${application.craftsman._id}`}>
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center border-2 border-primary/30 shadow-lg overflow-hidden">
                    <Image
                      src={application.craftsman.profilePicture}
                      alt={application.craftsman.fullName}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </Link>
              ) : (
                <Link href={`/users/${application.craftsman._id}`}>
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center border-2 border-primary/30 shadow-lg">
                    <FaUser className="text-primary-foreground w-9 h-9" />
                  </div>
                </Link>
              )}

              {/* Rating Badge */}
              {application.craftsman.rating && (
                <div className="absolute -bottom-2 inset-x-0 mx-auto w-max bg-warning text-warning-foreground rounded-full px-2 py-1 flex items-center border-2 border-background shadow-md">
                  <FaStar className="w-3 h-3" />
                  <span className="text-xs font-bold ml-1">
                    {application.craftsman.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Start Chat Button - Visible only if not declined */}
            {!isDeclined && (
              <Button
                variant="outline"
                className="mt-6 border border-primary/30 hover:border-primary/50 hover:bg-primary/10 text-primary hover:text-primary font-medium py-2 px-4 rounded-lg transition-all duration-200 w-full"
                onClick={() =>
                  handleStartChat(
                    application.craftsman._id,
                    application.craftsman.fullName
                  )
                }
                disabled={actionLoading === `chat-${application.craftsman._id}`}
              >
                {actionLoading === `chat-${application.craftsman._id}` ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner
                      size="sm"
                      className={`${
                        locale === 'ar' ? 'ml-2' : 'mr-2'
                      } text-primary`}
                    />
                    <span className="text-sm">
                      {t('application.actions.startingChat')}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <FaComments
                      className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
                    />
                    <span className="text-sm">
                      {t('application.actions.startChat')}
                    </span>
                  </div>
                )}
              </Button>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Craftsman Header */}
            <div className="mb-4 pb-4 border-b border-border/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-xl font-bold text-foreground">
                  <Link
                    href={`/user/${application.craftsman._id}`}
                    className="hover:text-primary transition-colors duration-200 flex items-center gap-1"
                  >
                    {application.craftsman.fullName}
                  </Link>
                </h3>

                {application.craftsman.ratingCount && (
                  <p className="text-muted-foreground text-sm">
                    {application.craftsman.ratingCount}{' '}
                    {t('application.reviews')}
                  </p>
                )}
              </div>

              {/* Applied Date - Always visible */}
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <FaFileAlt className="w-4 h-4 opacity-70" />
                <span className="text-sm">
                  {t('application.applied')}:{' '}
                  {new Date(application.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Quote Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              {/* Price Card */}
              <div className="bg-gradient-to-br from-success/5 to-success/10 rounded-lg p-4 border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <FaDollarSign className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('application.price')}
                  </span>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-success to-success bg-clip-text text-transparent">
                  ${application.price}
                </div>
              </div>

              {/* Status Indicator */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  {t('application.statusLabel')}
                </div>
                <div
                  className={`font-semibold ${
                    isDeclined
                      ? 'text-destructive'
                      : isSubmitted
                      ? 'text-primary'
                      : 'text-success'
                  }`}
                >
                  {t(`application.status.${application.status.toLowerCase()}`)}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {application.notes && (
              <div className="bg-gradient-to-br from-card to-card/50 rounded-lg p-4 border border-border/30 mb-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground block mb-1">
                    {t('application.notes')}:
                  </span>
                  {application.notes}
                </p>
              </div>
            )}

            {/* Accept/Reject Buttons - Only for pending applications */}
            {job?.status === 'Posted' && isSubmitted && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleAcceptQuote(application._id)}
                  disabled={actionLoading === application._id}
                  className="bg-gradient-to-r from-success to-success/90 hover:from-success hover:to-success text-success-foreground font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {actionLoading === application._id ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner
                        size="sm"
                        className={`${
                          locale === 'ar' ? 'ml-2' : 'mr-2'
                        } text-success-foreground`}
                      />
                      <span>{t('application.actions.accepting')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <FaCheck
                        className={`w-4 h-4 ${
                          locale === 'ar' ? 'ml-2' : 'mr-2'
                        }`}
                      />
                      <span>{t('application.actions.hire')}</span>
                    </div>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="border border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10 text-destructive hover:text-destructive font-medium py-2.5 px-5 rounded-lg transition-all duration-200"
                  onClick={() => handleRejectQuote(application._id)}
                >
                  <div className="flex items-center justify-center">
                    <FaTimes
                      className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
                    />
                    <span>{t('application.actions.decline')}</span>
                  </div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Component: Empty State
  const EmptyState = () => (
    <div className="text-center py-12 sm:py-16">
      <div className="w-24 h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <FaUser className="w-12 h-12 text-primary" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-3">
        {t('emptyState.title')}
      </h3>
      <p className="text-lg text-muted-foreground max-w-md mx-auto">
        {t('emptyState.message')}
      </p>
    </div>
  );

  // Component: Applications List
  const ApplicationsList = () => (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <h2 className="text-2xl font-bold text-foreground">
          {t('applicationsTitle', { count: applications.length })}
        </h2>
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-full px-4 py-2 border border-primary/20">
          <span className="text-primary font-semibold">
            {applications.length}{' '}
            {applications.length === 1
              ? t('application.singular')
              : t('application.plural')}
          </span>
        </div>
      </div>

      {applications.map((application) => (
        <ApplicationCard key={application._id} application={application} />
      ))}
    </div>
  );

  // Main render logic
  if (loading) return <LoadingState />;
  if (error || !job) return <ErrorState />;

  return (
    <Container className="py-4 sm:py-6 lg:py-8">
      <main role="main">
        <JobHeader />

        {applications.length === 0 ? <EmptyState /> : <ApplicationsList />}
      </main>
    </Container>
  );
};

export default JobApplicationsPage;
