'use client';

import Button from '@/app/components/ui/button';
import {
  FaBriefcase,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaEye,
  FaMapMarkerAlt,
  FaUsers,
} from 'react-icons/fa';
import JobOptionsDropdown from '@/app/components/jobs/job-options-dropdown';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Job } from '@/app/types/jobs';
import { formatDate, formatAddress, getStatusColor } from '@/app/utils/helpers';

interface MyJobCardProps {
  job: Job;
  isRTL: boolean;
  deleteLoading: string | null;
  openRecommendationsModal: (jobId: string, jobTitle: string) => void;
  openDeleteModal: (jobId: string, jobTitle: string) => void;
  handleCancelJob: (jobId: string) => void;
  cancelLoading: string | null;
}

const MyJobCard = ({
  job,
  isRTL,
  deleteLoading,
  openRecommendationsModal,
  openDeleteModal,
  handleCancelJob,
  cancelLoading,
}: MyJobCardProps) => {
  const t = useTranslations('myJobs');
  const router = useRouter();
  const locale = useLocale();

  const handleViewJob = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  const handleEditJob = (jobId: string) => {
    router.push(`/sc/create-job?edit=${jobId}`);
  };

  const handleViewApplications = (jobId: string) => {
    router.push(`/sc/jobs/${jobId}/applications`);
  };

  const getPaymentTypeText = (paymentType: string) => {
    return t(`paymentTypes.${paymentType}`) || paymentType;
  };

  const getStatusText = (status: string) => {
    return t(`status.${status}`) || status;
  };

  return (
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

            {/* View Job Icon Button */}
            <button
              onClick={() => handleViewJob(job._id)}
              className="p-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 rounded-xl transition-all duration-200 transform hover:scale-105 group/view"
              title={t('buttons.viewJob')}
            >
              <FaEye className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover/view:scale-110 transition-transform duration-200" />
            </button>

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
                {formatDate(job.createdAt, locale)}
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
                {job.status === 'Posted' ? 'Status' : t('jobCard.applications')}
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
            {/* View Applications Button */}
            {job.appliedCraftsmen && job.appliedCraftsmen.length > 0 && (
              <Button
                onClick={() => handleViewApplications(job._id)}
                className={`flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}
              >
                <FaUsers className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('buttons.viewApplications')} ({job.appliedCraftsmen.length})
              </Button>
            )}

            {/* Get Recommendations Button */}
            <Button
              variant="outline"
              onClick={() => openRecommendationsModal(job._id, job.title)}
              className={`flex-1 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 font-medium py-3 px-6 rounded-xl transition-all duration-200 ${
                isRTL ? 'flex-row-reverse' : ''
              }`}
            >
              <FaUsers className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('buttons.getRecommendations')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobCard;
