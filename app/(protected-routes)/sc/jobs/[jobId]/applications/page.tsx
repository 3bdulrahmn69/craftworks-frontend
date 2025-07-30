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
    <Container className={`py-8 max-w-6xl ${locale === 'ar' ? 'rtl' : 'ltr'}`}>
      <main role="main" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {/* Header */}
        <header className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className={`mb-4 p-2 hover:bg-accent flex items-center ${
              locale === 'ar' ? 'flex-row-reverse' : ''
            }`}
          >
            <FaArrowLeft
              className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
            />
            {t('header.backToJob')}
          </Button>

          <div className="bg-background border rounded-lg p-6 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center">
              <FaBriefcase
                className={`text-primary ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}
              />
              {job.title}
            </h1>
            <div
              className={`flex flex-wrap gap-4 text-sm text-muted-foreground ${
                locale === 'ar' ? 'flex-row-reverse justify-end' : ''
              }`}
            >
              <span>
                {t('header.status')}: {job.status}
              </span>
              <span>
                {t('header.payment')}: {job.paymentType}
              </span>
              <span>
                {t('header.price')}: {job.jobPrice} {t('currency')}
              </span>
              <span>
                {t('header.applicationsCount')}: {applications.length}
              </span>
            </div>
          </div>
        </header>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div
            className={`text-center py-12 ${locale === 'ar' ? 'rtl' : 'ltr'}`}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <FaUser className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('emptyState.title')}
            </h3>
            <p className="text-muted-foreground">{t('emptyState.message')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <div
                key={application._id}
                className="bg-background border rounded-lg p-6 hover:shadow-md transition-shadow"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                <div
                  className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${
                    locale === 'ar' ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Craftsman Info */}
                  <div className="flex-1">
                    <div
                      className={`flex items-start gap-4 ${
                        locale === 'ar' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      {application.craftsman.profilePicture ? (
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 overflow-hidden">
                          <Image
                            src={application.craftsman.profilePicture}
                            alt={application.craftsman.fullName}
                            width={48}
                            height={48}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                          <FaUser className="text-primary" />
                        </div>
                      )}

                      <div className="flex-1">
                        <div
                          className={`flex items-center gap-2 mb-2 ${
                            locale === 'ar'
                              ? 'flex-row-reverse justify-end'
                              : ''
                          }`}
                        >
                          <h3
                            className={`text-lg font-semibold text-foreground ${
                              locale === 'ar' ? 'text-right' : 'text-left'
                            }`}
                          >
                            {application.craftsman.fullName}
                          </h3>
                          {application.craftsman.rating && (
                            <div
                              className={`flex items-center gap-1 text-sm text-muted-foreground ${
                                locale === 'ar' ? 'flex-row-reverse' : ''
                              }`}
                            >
                              <FaStar className="text-yellow-500 w-3 h-3" />
                              <span>
                                {application.craftsman.rating.toFixed(1)}
                              </span>
                              {application.craftsman.ratingCount && (
                                <span>
                                  ({application.craftsman.ratingCount}{' '}
                                  {t('application.reviews')})
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div
                          className={`flex items-center gap-4 text-sm text-muted-foreground mb-3 ${
                            locale === 'ar'
                              ? 'flex-row-reverse justify-end'
                              : ''
                          }`}
                        >
                          <div
                            className={`flex items-center gap-1 ${
                              locale === 'ar' ? 'flex-row-reverse' : ''
                            }`}
                          >
                            <FaDollarSign className="w-3 h-3" />
                            <span className="font-semibold text-lg text-foreground">
                              {application.price} {t('currency')}
                            </span>
                          </div>
                          <span>
                            {t('application.applied')}:{' '}
                            {new Date(
                              application.createdAt
                            ).toLocaleDateString()}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              application.status === 'Accepted'
                                ? 'bg-green-100 text-green-800'
                                : application.status === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {t(
                              `application.status.${application.status.toLowerCase()}`
                            )}
                          </span>
                        </div>

                        {application.notes && (
                          <div className="bg-muted/30 rounded-lg p-3">
                            <div
                              className={`flex items-center gap-2 mb-2 ${
                                locale === 'ar'
                                  ? 'flex-row-reverse justify-end'
                                  : ''
                              }`}
                            >
                              <FaFileAlt className="w-3 h-3 text-muted-foreground" />
                              <span
                                className={`text-sm font-medium text-foreground ${
                                  locale === 'ar' ? 'text-right' : 'text-left'
                                }`}
                              >
                                {t('application.notes')}:
                              </span>
                            </div>
                            <p
                              className={`text-sm text-muted-foreground ${
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
                        className={`flex gap-3 lg:flex-col ${
                          locale === 'ar' ? 'lg:flex-col-reverse' : ''
                        }`}
                      >
                        <Button
                          onClick={() => handleAcceptQuote(application._id)}
                          disabled={actionLoading === application._id}
                          className="flex-1 lg:flex-none"
                          size="sm"
                        >
                          {actionLoading === application._id ? (
                            <div
                              className={`flex items-center ${
                                locale === 'ar' ? 'flex-row-reverse' : ''
                              }`}
                            >
                              <LoadingSpinner
                                size="sm"
                                className={locale === 'ar' ? 'ml-2' : 'mr-2'}
                              />
                              {t('application.actions.accepting')}
                            </div>
                          ) : (
                            <div
                              className={`flex items-center ${
                                locale === 'ar' ? 'flex-row-reverse' : ''
                              }`}
                            >
                              <FaCheck
                                className={`w-3 h-3 ${
                                  locale === 'ar' ? 'ml-2' : 'mr-2'
                                }`}
                              />
                              {t('application.actions.acceptQuote')}
                            </div>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 lg:flex-none"
                          onClick={() => {
                            // TODO: Implement reject functionality if needed
                            toast.info(t('application.actions.rejectSoon'));
                          }}
                        >
                          <div
                            className={`flex items-center ${
                              locale === 'ar' ? 'flex-row-reverse' : ''
                            }`}
                          >
                            <FaTimes
                              className={`w-3 h-3 ${
                                locale === 'ar' ? 'ml-2' : 'mr-2'
                              }`}
                            />
                            {t('application.actions.decline')}
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
  );
};

export default JobApplicationsPage;
