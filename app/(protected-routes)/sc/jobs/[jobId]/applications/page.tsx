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
} from 'react-icons/fa';

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

        // Fetch job details and applications in parallel
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
        // Refresh the data
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
        // Refresh the data
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

  if (loading) {
    return (
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
  }

  if (error || !job) {
    return (
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
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <Container className="py-4 sm:py-6 lg:py-8">
        <main role="main">
          {/* Header */}
          <header className="mb-6 sm:mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className={`mb-4 sm:mb-6 p-2 sm:p-3 hover:bg-primary/10 rounded-lg transition-all duration-200 flex items-center group ${
                locale === 'ar' ? 'flex-row-reverse' : ''
              }`}
            >
              <FaArrowLeft
                className={`w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-200 ${
                  locale === 'ar' ? 'ml-2' : 'mr-2'
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
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary via-primary/90 to-primary rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                      <FaBriefcase className="text-primary-foreground w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="truncate">{job.title}</span>
                  </h1>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-muted backdrop-blur-sm rounded-lg p-3 border border-primary/20 shadow-sm">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                        {t('header.status')}
                      </div>
                      <div
                        className={`font-semibold px-2 py-1 rounded-full text-xs sm:text-sm inline-block ${
                          job.status === 'Posted'
                            ? 'bg-success/10 text-success border border-success/20'
                            : job.status === 'Hired'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : job.status === 'In Progress'
                            ? 'bg-warning/10 text-warning border border-warning/20'
                            : job.status === 'Completed'
                            ? 'bg-success/10 text-success border border-success/20'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        {job.status}
                      </div>
                    </div>

                    <div className="bg-muted backdrop-blur-sm rounded-lg p-3 border border-primary/20 shadow-sm">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                        {t('header.payment')}
                      </div>
                      <div className="font-semibold text-foreground text-sm">
                        {job.paymentType}
                      </div>
                    </div>

                    <div className="bg-muted backdrop-blur-sm rounded-lg p-3 border border-success/20 shadow-sm">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                        {t('header.price')}
                      </div>
                      <div className="font-bold text-lg bg-gradient-to-r from-success to-success bg-clip-text text-transparent">
                        ${job.jobPrice}
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

          {/* Applications List */}
          {applications.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <FaUser className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">
                {t('emptyState.title')}
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto">
                {t('emptyState.message')}
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {t('applicationsTitle', { count: applications.length })}
                </h2>
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-full px-3 sm:px-4 py-2 border border-primary/20">
                  <span className="text-primary font-semibold text-sm sm:text-base">
                    {applications.length}{' '}
                    {applications.length === 1
                      ? t('application.singular')
                      : t('application.plural')}
                  </span>
                </div>
              </div>

              {applications.map((application, index) => (
                <div
                  key={application._id}
                  className="bg-gradient-to-r from-card via-card/95 to-primary/5 border border-border/50 hover:border-primary/30 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards',
                  }}
                >
                  <div
                    className={`flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 sm:gap-6`}
                  >
                    {/* Craftsman Info */}
                    <div className="flex-1">
                      <div
                        className={`flex items-start gap-3 sm:gap-4 lg:gap-6 ${
                          locale === 'ar' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {application.craftsman.profilePicture ? (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary via-primary/90 to-primary rounded-xl flex items-center justify-center border-2 border-primary/20 shadow-lg overflow-hidden">
                            <Image
                              src={application.craftsman.profilePicture}
                              alt={application.craftsman.fullName}
                              width={64}
                              height={64}
                              className="w-full h-full rounded-lg object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary via-primary/90 to-primary rounded-xl flex items-center justify-center border-2 border-primary/20 shadow-lg">
                            <FaUser className="text-primary-foreground w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div
                            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 ${
                              locale === 'ar' ? 'sm:flex-row-reverse' : ''
                            }`}
                          >
                            <div className="min-w-0">
                              <h3
                                className={`text-lg sm:text-xl font-bold text-foreground mb-2 truncate ${
                                  locale === 'ar' ? 'text-right' : 'text-left'
                                }`}
                              >
                                {application.craftsman.fullName}
                              </h3>
                              {application.craftsman.rating && (
                                <div
                                  className={`flex items-center gap-1 sm:gap-2 text-sm ${
                                    locale === 'ar'
                                      ? 'flex-row-reverse justify-end'
                                      : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-1 bg-warning/10 rounded-full px-2 sm:px-3 py-1 border border-warning/20">
                                    <FaStar className="text-warning w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="font-semibold text-warning text-xs sm:text-sm">
                                      {application.craftsman.rating.toFixed(1)}
                                    </span>
                                  </div>
                                  {application.craftsman.ratingCount && (
                                    <span className="text-muted-foreground text-xs sm:text-sm">
                                      ({application.craftsman.ratingCount}{' '}
                                      {t('application.reviews')})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div
                              className={`flex items-center gap-2 sm:gap-3 ${
                                locale === 'ar' ? 'flex-row-reverse' : ''
                              }`}
                            >
                              <span
                                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold ${
                                  application.status === 'Accepted'
                                    ? 'bg-success/10 text-success border border-success/20'
                                    : application.status === 'Declined'
                                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                    : 'bg-primary/10 text-primary border border-primary/20'
                                }`}
                              >
                                {t(
                                  `application.status.${application.status.toLowerCase()}`
                                )}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 ${
                              locale === 'ar' ? 'text-right' : 'text-left'
                            }`}
                          >
                            <div className="bg-muted backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-success/20 shadow-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <FaDollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                                <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                                  {t('application.price')}
                                </span>
                              </div>
                              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-success to-success bg-clip-text text-transparent">
                                ${application.price}
                              </span>
                            </div>

                            <div className="bg-muted backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-primary/20 shadow-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <FaFileAlt className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                                  {t('application.applied')}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-foreground">
                                {new Date(
                                  application.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {application.notes && (
                            <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border border-border/30">
                              <div
                                className={`flex items-center gap-2 mb-2 sm:mb-3 ${
                                  locale === 'ar'
                                    ? 'flex-row-reverse justify-end'
                                    : ''
                                }`}
                              >
                                <FaFileAlt className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                <span
                                  className={`text-sm font-semibold text-foreground ${
                                    locale === 'ar' ? 'text-right' : 'text-left'
                                  }`}
                                >
                                  {t('application.notes')}:
                                </span>
                              </div>
                              <p
                                className={`text-sm text-muted-foreground leading-relaxed ${
                                  locale === 'ar' ? 'text-right' : 'text-left'
                                }`}
                              >
                                {application.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {job.status === 'Posted' &&
                      application.status === 'Submitted' && (
                        <div
                          className={`flex flex-col sm:flex-row gap-3 xl:flex-col xl:gap-3 ${
                            locale === 'ar'
                              ? 'sm:flex-row-reverse xl:flex-col-reverse'
                              : ''
                          }`}
                        >
                          <Button
                            onClick={() => handleAcceptQuote(application._id)}
                            disabled={actionLoading === application._id}
                            className="bg-gradient-to-r from-success to-success hover:from-success/90 hover:to-success/90 text-success-foreground font-semibold py-2.5 px-4 sm:px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] min-w-[120px] sm:min-w-[140px]"
                            size="sm"
                          >
                            {actionLoading === application._id ? (
                              <div
                                className={`flex items-center justify-center ${
                                  locale === 'ar' ? 'flex-row-reverse' : ''
                                }`}
                              >
                                <LoadingSpinner
                                  size="sm"
                                  className={`${
                                    locale === 'ar' ? 'ml-2' : 'mr-2'
                                  } text-success-foreground`}
                                />
                                <span className="text-xs sm:text-sm">
                                  {t('application.actions.accepting')}
                                </span>
                              </div>
                            ) : (
                              <div
                                className={`flex items-center justify-center ${
                                  locale === 'ar' ? 'flex-row-reverse' : ''
                                }`}
                              >
                                <FaCheck
                                  className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                    locale === 'ar' ? 'ml-2' : 'mr-2'
                                  }`}
                                />
                                <span className="text-xs sm:text-sm">
                                  {t('application.actions.acceptQuote')}
                                </span>
                              </div>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="border border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10 text-destructive hover:text-destructive font-semibold py-2.5 px-4 sm:px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] min-w-[120px] sm:min-w-[140px]"
                            onClick={() => handleRejectQuote(application._id)}
                          >
                            <div
                              className={`flex items-center justify-center ${
                                locale === 'ar' ? 'flex-row-reverse' : ''
                              }`}
                            >
                              <FaTimes
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                  locale === 'ar' ? 'ml-2' : 'mr-2'
                                }`}
                              />
                              <span className="text-xs sm:text-sm">
                                {t('application.actions.decline')}
                              </span>
                            </div>
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </Container>
    </>
  );
};

export default JobApplicationsPage;
