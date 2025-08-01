'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Container from '@/app/components/ui/container';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import Button from '@/app/components/ui/button';
import PaginationComponent from '@/app/components/ui/pagination-component';
import { Job, Pagination } from '@/app/types/jobs';
import { jobsService } from '@/app/services/jobs';
import { formatDate, formatAddress, getStatusColor } from '@/app/utils/helpers';
import { toast } from 'react-toastify';
import {
  FaBriefcase,
  FaPlus,
  FaMapMarkerAlt,
  FaDollarSign,
  FaCalendarAlt,
  FaEye,
  FaUsers,
  FaClock,
} from 'react-icons/fa';

const ClientJobsPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch jobs posted by the client
        const response = await jobsService.getJobs(
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
          setError(response.message || 'Failed to fetch jobs');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching jobs');
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [session?.accessToken, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Loading Your Jobs
            </h3>
            <p className="text-muted-foreground">
              Please wait while we fetch your job listings...
            </p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 max-w-7xl">
      <main role="main">
        {/* Header Section */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center">
              <FaBriefcase className="inline-block mr-3 text-primary" />
              My Jobs
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Manage your job postings and track their progress
            </p>
          </div>

          <Button
            onClick={() => router.push('/sc/services')}
            className="mt-4 sm:mt-0"
          >
            <FaPlus className="w-4 h-4 mr-2" />
            Create New Job
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
              No Jobs Posted Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              You haven&apos;t created any job postings yet. Start by creating
              your first job.
            </p>
            <Button onClick={() => router.push('/sc/services')}>
              <FaPlus className="w-4 h-4 mr-2" />
              Create Your First Job
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-background border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  {/* Job Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-semibold text-foreground line-clamp-2">
                        {job.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <p className="text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="w-4 h-4 mr-1 text-primary" />
                        {formatAddress(job.address)}
                      </div>

                      <div className="flex items-center">
                        <FaDollarSign className="w-4 h-4 mr-1 text-primary" />
                        {job.jobPrice} EGP ({job.paymentType})
                      </div>

                      <div className="flex items-center">
                        <FaCalendarAlt className="w-4 h-4 mr-1 text-primary" />
                        {formatDate(job.createdAt, locale)}
                      </div>

                      {job.service && (
                        <div className="flex items-center">
                          <FaBriefcase className="w-4 h-4 mr-1 text-primary" />
                          {job.service.name}
                        </div>
                      )}
                    </div>

                    {/* Job Stats */}
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <FaUsers className="w-4 h-4 mr-1" />
                        <span>
                          {job.appliedCraftsmen?.length || 0} applications
                        </span>
                      </div>

                      {job.status === 'Posted' && (
                        <div className="flex items-center text-blue-600">
                          <FaClock className="w-4 h-4 mr-1" />
                          <span>Open for applications</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/jobs/${job._id}`)}
                    >
                      <FaEye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>

                    {job.status === 'Posted' &&
                      job.appliedCraftsmen &&
                      job.appliedCraftsmen.length > 0 && (
                        <Button
                          size="sm"
                          onClick={() => router.push(`/jobs/${job._id}/quotes`)}
                        >
                          <FaUsers className="w-4 h-4 mr-2" />
                          View Applications ({job.appliedCraftsmen.length})
                        </Button>
                      )}
                  </div>
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
      </main>
    </Container>
  );
};

export default ClientJobsPage;
