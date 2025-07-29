'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Job } from '@/app/types/jobs';
import { jobsService } from '@/app/services/jobs';
import Container from '@/app/components/ui/container';
import Button from '@/app/components/ui/button';
import JobsModal from '@/app/components/jobs/jobs-modal';
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
} from 'react-icons/hi';

const JobDetailsPage = () => {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [submittingQuote, setSubmittingQuote] = useState(false);

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

  const formatAddress = (address: any) => {
    if (typeof address === 'string') return address;
    if (typeof address === 'object' && address) {
      const parts = [
        address.street,
        address.city,
        address.state,
        address.country,
      ].filter(Boolean);
      return parts.join(', ');
    }
    return 'Location not specified';
  };

  const isApplied = job?.appliedCraftsmen?.includes(session?.user?.id || '');

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Loading job details...</div>
        </div>
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container>
        <div className="text-center py-16">
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border max-w-md mx-auto">
            <HiExclamationCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {error || 'Job not found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              The job you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <main role="main">
        {/* Header with back button */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6"
          >
            <HiArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {job.title}
              </h1>
            </div>

            {/* Action button */}
            {job.status === 'Posted' && session?.user?.role === 'craftsman' && (
              <div className="lg:flex-shrink-0">
                <Button
                  onClick={() => setShowQuoteModal(true)}
                  disabled={isApplied}
                  variant={isApplied ? 'outline' : 'primary'}
                  size="lg"
                  className="w-full lg:w-auto"
                >
                  {isApplied ? (
                    <>
                      <HiCheckCircle className="w-5 h-5 mr-2" />
                      Applied
                    </>
                  ) : (
                    'Submit Quote'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Job Description
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            {/* Photos */}
            {job.photos && job.photos.length > 0 && (
              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <HiPhotograph className="w-5 h-5 mr-2" />
                  Photos
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {job.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative rounded-lg overflow-hidden h-48"
                    >
                      <Image
                        src={photo}
                        alt={`Job photo ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Map placeholder */}
            {job.location && (
              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <HiLocationMarker className="w-5 h-5 mr-2" />
                  Location
                </h2>
                <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <HiLocationMarker className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Coordinates: {job.location.coordinates[1]},{' '}
                      {job.location.coordinates[0]}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Map integration coming soon
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Information */}
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Job Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <HiLocationMarker className="w-4 h-4 mr-3 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {formatAddress(job.address)}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <HiCash className="w-4 h-4 mr-3 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Payment: {job.paymentType}
                  </span>
                </div>

                {job.jobPrice > 0 && (
                  <div className="flex items-center text-sm">
                    <HiCurrencyDollar className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                    <span className="text-foreground font-medium">
                      Budget: {job.jobPrice.toLocaleString()} EGP
                    </span>
                  </div>
                )}

                <div className="flex items-center text-sm">
                  <HiClock className="w-4 h-4 mr-3 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Posted{' '}
                    {new Date(job.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {job.appliedCraftsmen && job.appliedCraftsmen.length > 0 && (
                  <div className="flex items-center text-sm">
                    <HiUsers className="w-4 h-4 mr-3 text-amber-600 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {job.appliedCraftsmen.length} application
                      {job.appliedCraftsmen.length > 1 ? 's' : ''}
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
                  <h3 className="font-semibold text-foreground mb-2">
                    Interested in this job?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Submit your quote and get hired by the client.
                  </p>
                  <Button
                    onClick={() => setShowQuoteModal(true)}
                    className="w-full"
                  >
                    Submit Quote
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
                  toastService.success('Quote submitted successfully! 🎉');
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
                  toastService.success('Quote submitted successfully! 🎉');
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
                    response.message || 'Failed to submit quote'
                  );
                }
              } catch (err: any) {
                toastService.error(
                  err.message || 'An error occurred while submitting quote'
                );
              } finally {
                setSubmittingQuote(false);
              }
            }}
            submittingQuote={submittingQuote}
          />
        )}
      </main>
    </Container>
  );
};

export default JobDetailsPage;
