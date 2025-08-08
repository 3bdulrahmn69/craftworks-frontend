'use client';

import { useLocale } from 'next-intl';
import { Job } from '@/app/types/jobs';
import { getServiceName } from '@/app/services/services';
import { formatAddress } from '@/app/utils/helpers';
import {
  HiLocationMarker,
  HiCash,
  HiClock,
  HiUsers,
  HiTag,
} from 'react-icons/hi';
import Link from 'next/link';

interface JobCardProps {
  job: Job;
  isApplied: boolean;
}

const JobCard = ({ job }: JobCardProps) => {
  const locale = useLocale();

  // According to API v1.3.0, jobs now include populated service objects
  const serviceName = job.service
    ? getServiceName(job.service, locale)
    : job.category || 'General';

  return (
    <Link href={`/jobs/${job._id}`} className="w-full block">
      <div
        className={`bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-border group cursor-pointer w-full hover:border-primary/30 relative overflow-hidden`}
      >
        {/* Gradient overlay for enhanced visual appeal */}
        <div
          className={`absolute top-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-[100px] pointer-events-none rounded-br-[100px]`}
        />

        {/* Header Section */}
        <div
          className={`flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6 relative`}
        >
          <div className="flex-1">
            <div className={`flex items-start gap-3 mb-3`}>
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
              <p className="text-sm font-semibold text-foreground">
                {locale === 'ar' ? 'الموقع' : 'Location'}
              </p>
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
              <p className="text-sm font-semibold text-foreground">
                {locale === 'ar' ? 'الدفع' : 'Payment'}
              </p>
              <p className="text-sm text-muted-foreground">{job.paymentType}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors border border-transparent hover:border-primary/20">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HiClock className="w-5 h-5 text-primary shrink-0" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {locale === 'ar' ? 'الوقت' : 'Time'}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {job.jobDate && (
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors border border-primary/20">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HiClock className="w-5 h-5 text-primary shrink-0" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary">
                  {locale === 'ar' ? 'تاريخ مجدول' : 'Scheduled Date'}
                </p>
                <p className="text-sm text-primary/70">
                  {new Date(job.jobDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {job.appliedCraftsmen && (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-success/5 to-success/10 border border-success/20 rounded-xl hover:shadow-md transition-shadow">
              <div className="p-2 bg-success/10 rounded-lg">
                <HiUsers className="w-5 h-5 text-success shrink-0" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-success">
                  {locale === 'ar' ? 'الحرفيين المتقدمين' : 'Craftsmen Applied'}
                </p>
                <p className="text-sm text-success/70">
                  {job.appliedCraftsmen.length}{' '}
                  {locale === 'ar' ? 'حرفي' : 'craftsmen'}{' '}
                  {locale === 'ar' ? 'تقدموا' : 'applied'}
                </p>
              </div>
              <div className="px-2 py-1 bg-success/10 text-success text-xs rounded-full font-medium border border-success/20">
                {locale === 'ar' ? 'نشط' : 'Active'}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
