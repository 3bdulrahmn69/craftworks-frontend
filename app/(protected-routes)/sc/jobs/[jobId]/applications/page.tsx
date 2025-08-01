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
        window.location.reload();
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

      <Container
        className={`py-8 max-w-7xl ${locale === 'ar' ? 'rtl' : 'ltr'}`}
      >
        <main role="main" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          {/* Header */}
          <header className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className={`mb-6 p-3 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 rounded-xl transition-all duration-200 flex items-center group ${
                locale === 'ar' ? 'flex-row-reverse' : ''
              }`}
            >
              <FaArrowLeft
                className={`w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-200 ${
                  locale === 'ar' ? 'ml-2' : 'mr-2'
                }`}
              />
              <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                {t('header.backToJob')}
              </span>
            </Button>

            <div className="bg-gradient-to-r from-white via-primary/5 to-primary/10 dark:from-gray-900 dark:via-primary/5 dark:to-primary/10 border border-primary/20 rounded-2xl p-8 mb-8 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4 flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <FaBriefcase className="text-white w-6 h-6" />
                    </div>
                    {job.title}
                  </h1>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-primary/10">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                        {t('header.status')}
                      </div>
                      <div
                        className={`font-semibold px-2 py-1 rounded-full text-sm inline-block ${
                          job.status === 'Posted'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : job.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}
                      >
                        {job.status}
                      </div>
                    </div>

                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-primary/10">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                        {t('header.payment')}
                      </div>
                      <div className="font-semibold text-foreground">
                        {job.paymentType}
                      </div>
                    </div>

                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-primary/10">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                        {t('header.price')}
                      </div>
                      <div className="font-bold text-lg bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                        {job.jobPrice} {t('currency')}
                      </div>
                    </div>

                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-primary/10">
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
            <div
              className={`text-center py-16`}
            >
              <div className="w-24 h-24 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FaUser className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {t('emptyState.title')}
              </h3>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                {t('emptyState.message')}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {t('applicationsTitle', { count: applications.length })}
                </h2>
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-full px-4 py-2">
                  <span className="text-primary font-semibold">
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
                  className="bg-gradient-to-r from-white via-primary/5 to-primary/10 dark:from-gray-900 dark:via-primary/5 dark:to-primary/10 border border-primary/20 rounded-2xl p-8 hover:shadow-xl hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1"
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards',
                  }}
                >
                  <div
                    className={`flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 ${
                      locale === 'ar' ? 'xl:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Craftsman Info */}
                    <div className="flex-1">
                      <div
                        className={`flex items-start gap-6 ${
                          locale === 'ar' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {application.craftsman.profilePicture ? (
                          <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden">
                            <Image
                              src={application.craftsman.profilePicture}
                              alt={application.craftsman.fullName}
                              width={64}
                              height={64}
                              className="w-full h-full rounded-xl object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                            <FaUser className="text-white w-6 h-6" />
                          </div>
                        )}

                        <div className="flex-1">
                          <div
                            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 ${
                              locale === 'ar' ? 'sm:flex-row-reverse' : ''
                            }`}
                          >
                            <div>
                              <h3
                                className={`text-xl font-bold text-foreground mb-2 ${
                                  locale === 'ar' ? 'text-right' : 'text-left'
                                }`}
                              >
                                {application.craftsman.fullName}
                              </h3>
                              {application.craftsman.rating && (
                                <div
                                  className={`flex items-center gap-2 text-sm ${
                                    locale === 'ar'
                                      ? 'flex-row-reverse justify-end'
                                      : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full px-3 py-1">
                                    <FaStar className="text-yellow-500 w-4 h-4" />
                                    <span className="font-semibold text-yellow-700 dark:text-yellow-400">
                                      {application.craftsman.rating.toFixed(1)}
                                    </span>
                                  </div>
                                  {application.craftsman.ratingCount && (
                                    <span className="text-muted-foreground">
                                      ({application.craftsman.ratingCount}{' '}
                                      {t('application.reviews')})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div
                              className={`flex items-center gap-3 ${
                                locale === 'ar' ? 'flex-row-reverse' : ''
                              }`}
                            >
                              <span
                                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                  application.status === 'Accepted'
                                    ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 dark:from-green-900/30 dark:to-green-800/20 dark:text-green-400 border border-green-200 dark:border-green-800'
                                    : application.status === 'Rejected'
                                    ? 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 dark:from-red-900/30 dark:to-red-800/20 dark:text-red-400 border border-red-200 dark:border-red-800'
                                    : 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                }`}
                              >
                                {t(
                                  `application.status.${application.status.toLowerCase()}`
                                )}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 ${
                              locale === 'ar' ? 'text-right' : 'text-left'
                            }`}
                          >
                            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-primary/10">
                              <div className="flex items-center gap-2 mb-1">
                                <FaDollarSign className="w-4 h-4 text-green-500" />
                                <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                                  {t('application.price')}
                                </span>
                              </div>
                              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                                {application.price} {t('currency')}
                              </span>
                            </div>

                            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-primary/10">
                              <div className="flex items-center gap-2 mb-1">
                                <FaFileAlt className="w-4 h-4 text-blue-500" />
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
                            <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-4 border border-primary/10">
                              <div
                                className={`flex items-center gap-2 mb-3 ${
                                  locale === 'ar'
                                    ? 'flex-row-reverse justify-end'
                                    : ''
                                }`}
                              >
                                <FaFileAlt className="w-4 h-4 text-primary" />
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
                          className={`flex flex-col sm:flex-row gap-4 xl:flex-col xl:gap-3 ${
                            locale === 'ar'
                              ? 'sm:flex-row-reverse xl:flex-col-reverse'
                              : ''
                          }`}
                        >
                          <Button
                            onClick={() => handleAcceptQuote(application._id)}
                            disabled={actionLoading === application._id}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 min-w-[140px]"
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
                                  } text-white`}
                                />
                                <span>
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
                                  className={`w-4 h-4 ${
                                    locale === 'ar' ? 'ml-2' : 'mr-2'
                                  }`}
                                />
                                <span>
                                  {t('application.actions.acceptQuote')}
                                </span>
                              </div>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-2 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 min-w-[140px]"
                            onClick={() => {
                              // TODO: Implement reject functionality if needed
                              toast.info(t('application.actions.rejectSoon'));
                            }}
                          >
                            <div
                              className={`flex items-center justify-center ${
                                locale === 'ar' ? 'flex-row-reverse' : ''
                              }`}
                            >
                              <FaTimes
                                className={`w-4 h-4 ${
                                  locale === 'ar' ? 'ml-2' : 'mr-2'
                                }`}
                              />
                              <span>{t('application.actions.decline')}</span>
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
