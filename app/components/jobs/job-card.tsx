'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Job } from '@/app/types/jobs';
import Button from '@/app/components/ui/button';
import { formatAddress } from '@/app/utils/helpers';
import {
  HiLocationMarker,
  HiCash,
  HiClock,
  HiUsers,
  HiCurrencyDollar,
  HiEye,
  HiTag,
} from 'react-icons/hi';

interface JobCardProps {
  job: Job;
  onQuoteClick: (job: Job) => void;
  isApplied: boolean;
}

const JobCard = ({ job, onQuoteClick, isApplied }: JobCardProps) => {
  const router = useRouter();
  const locale = useLocale();

  // According to API v1.3.0, jobs now include populated service objects
  const serviceName = job.service?.name || job.category || 'General';

  const handleQuoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuoteClick(job);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/jobs/${job._id}`);
  };

  return (
    <div
      onClick={() => router.push(`/jobs/${job._id}`)}
      className={`bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-border group cursor-pointer w-full hover:border-primary/30 relative overflow-hidden ${
        locale === 'ar' ? 'rtl' : 'ltr'
      }`}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Gradient overlay for enhanced visual appeal */}
      <div
        className={`absolute top-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-[100px] pointer-events-none ${
          locale === 'ar'
            ? 'left-0 rounded-br-[100px] rounded-bl-none bg-gradient-to-br'
            : 'right-0'
        }`}
      />

      {/* Header Section */}
      <div
        className={`flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6 relative ${
          locale === 'ar' ? 'lg:flex-row-reverse' : ''
        }`}
      >
        <div className="flex-1">
          <div
            className={`flex items-start gap-3 mb-3 ${
              locale === 'ar' ? 'flex-row-reverse text-right' : 'text-left'
            }`}
          >
            <div className="p-3 bg-primary/10 rounded-xl shrink-0 group-hover:bg-primary/20 transition-colors">
              <HiTag className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3
                className={`text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight mb-2 ${
                  locale === 'ar' ? 'text-right' : 'text-left'
                }`}
              >
                {job.title}
              </h3>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                {serviceName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <p
          className={`text-muted-foreground text-base leading-relaxed line-clamp-3 ${
            locale === 'ar' ? 'text-right' : 'text-left'
          }`}
        >
          {job.description}
        </p>
      </div>

      {/* Enhanced Job Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors border border-transparent hover:border-primary/20">
          <div className="p-2 bg-primary/10 rounded-lg">
            <HiLocationMarker className="w-5 h-5 text-primary shrink-0" />
          </div>
          <div
            className={`flex-1 min-w-0 ${
              locale === 'ar' ? 'text-right' : 'text-left'
            }`}
          >
            <p className="text-sm font-semibold text-foreground">Location</p>
            <p className="text-sm text-muted-foreground truncate">
              {formatAddress(job.address)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors border border-transparent hover:border-primary/20">
          <div className="p-2 bg-primary/10 rounded-lg">
            <HiCash className="w-5 h-5 text-primary shrink-0" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Payment</p>
            <p className="text-sm text-muted-foreground">{job.paymentType}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors border border-transparent hover:border-primary/20">
          <div className="p-2 bg-primary/10 rounded-lg">
            <HiClock className="w-5 h-5 text-primary shrink-0" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Posted</p>
            <p className="text-sm text-muted-foreground">
              {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {job.jobDate && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-800">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <HiClock className="w-5 h-5 text-blue-600 shrink-0" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                Scheduled
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {new Date(job.jobDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {job.appliedCraftsmen && job.appliedCraftsmen.length > 0 && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl hover:shadow-md transition-shadow">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <HiUsers className="w-5 h-5 text-green-600 shrink-0" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                Applications
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {job.appliedCraftsmen.length} craftsmen applied
              </p>
            </div>
            <div className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-xs rounded-full font-medium border border-green-200 dark:border-green-700">
              Active
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Action Buttons */}
      <div
        className={`flex flex-col sm:flex-row gap-3 relative ${
          locale === 'ar' ? 'sm:flex-row-reverse' : ''
        }`}
      >
        <Button
          onClick={handleViewDetails}
          variant="outline"
          className={`flex-1 group/btn border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 ${
            locale === 'ar' ? 'flex-row-reverse' : ''
          }`}
        >
          <HiEye
            className={`w-4 h-4 group-hover/btn:scale-110 transition-transform ${
              locale === 'ar' ? 'ml-2' : 'mr-2'
            }`}
          />
          View Details
        </Button>
        <Button
          onClick={handleQuoteClick}
          className={`flex-1 font-medium transition-all duration-200 ${
            isApplied
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300'
              : 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
          } ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
          disabled={isApplied}
          variant={isApplied ? 'outline' : 'primary'}
        >
          {isApplied ? (
            <>
              <HiUsers
                className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
              />
              Applied
            </>
          ) : (
            <>
              <HiCurrencyDollar
                className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
              />
              Submit Quote
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default JobCard;
