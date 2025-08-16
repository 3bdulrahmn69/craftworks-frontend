'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import {
  HiPlay,
  HiCheck,
  HiXMark,
  HiCalendar,
  HiClock,
  HiExclamationTriangle,
  HiCheckCircle,
} from 'react-icons/hi2';
import { Button } from '@/app/components/ui/button';
import { jobsService } from '@/app/services/jobs';
import { toastService } from '@/app/utils/toast';
import { Job } from '@/app/types/jobs';
import { formatDateTime, getStatusColor } from '@/app/utils/helpers';

interface JobStatusManagerProps {
  job: Job;
  userRole: 'client' | 'craftsman';
  userId: string;
  onStatusUpdate: (updatedJob: Job) => void;
  onReviewRequest?: () => void;
}

export const JobStatusManager = ({
  job,
  userRole,
  userId,
  onStatusUpdate,
  onReviewRequest,
}: JobStatusManagerProps) => {
  const t = useTranslations('jobStatus');
  const { data: session } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRescheduleInput, setShowRescheduleInput] = useState(false);
  const [newJobDate, setNewJobDate] = useState('');

  const isAssignedCraftsman =
    userRole === 'craftsman' && job.craftsman === userId;
  const isJobOwner =
    userRole === 'client' &&
    (typeof job.client === 'string'
      ? job.client === userId
      : job.client._id === userId);

  const updateJobStatus = async (
    status: 'On The Way' | 'Completed' | 'Cancelled' | 'Rescheduled',
    newDate?: string
  ) => {
    if (!session?.accessToken) return;

    try {
      setIsUpdating(true);
      const statusData: any = { status };
      if (newDate) {
        statusData.newJobDate = newDate;
      }

      const response = await jobsService.updateJobStatus(
        job._id,
        statusData,
        session.accessToken
      );

      if (response.success) {
        toastService.success(t('success.statusUpdated'));
        // Refresh job data
        const updatedJob = await jobsService.getJob(
          job._id,
          session.accessToken
        );
        if (updatedJob.success && updatedJob.data) {
          onStatusUpdate(updatedJob.data);
        }
        setShowRescheduleInput(false);
        setNewJobDate('');
      } else {
        toastService.error(response.message || t('errors.updateFailed'));
      }
    } catch (error: any) {
      toastService.error(error.message || t('errors.updateFailed'));
    } finally {
      setIsUpdating(false);
    }
  };

  const updateJobDate = async (newDate: string) => {
    if (!session?.accessToken) return;

    try {
      setIsUpdating(true);
      const response = await jobsService.updateJobDate(
        job._id,
        newDate,
        session.accessToken
      );

      if (response.success) {
        toastService.success(t('success.dateUpdated'));
        // Refresh job data
        const updatedJob = await jobsService.getJob(
          job._id,
          session.accessToken
        );
        if (updatedJob.success && updatedJob.data) {
          onStatusUpdate(updatedJob.data);
        }
      } else {
        toastService.error(response.message || t('errors.updateFailed'));
      }
    } catch (error: any) {
      toastService.error(error.message || t('errors.updateFailed'));
    } finally {
      setIsUpdating(false);
    }
  };

  const canChangeToOnTheWay = isAssignedCraftsman && job.status === 'Hired';
  const canMarkCompleted =
    isJobOwner && (job.status === 'Hired' || job.status === 'On The Way');
  const canCancel =
    (isJobOwner || isAssignedCraftsman) &&
    !['Completed', 'On The Way', 'Cancelled'].includes(job.status);
  const canReschedule = isAssignedCraftsman && job.status === 'On The Way';
  const canUpdateDate =
    isJobOwner &&
    job.status !== 'On The Way' &&
    !['Completed', 'Cancelled', 'Disputed'].includes(job.status);
  const canLeaveReview = job.status === 'Completed';

  if (
    !canChangeToOnTheWay &&
    !canMarkCompleted &&
    !canCancel &&
    !canReschedule &&
    !canUpdateDate &&
    !canLeaveReview
  ) {
    return null;
  }

  const statusBadgeClass = getStatusColor(job.status);
  const scheduledFor = job.jobDate ? formatDateTime(job.jobDate) : '';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Posted':
        return <HiCalendar className="w-4 h-4" />;
      case 'Hired':
        return <HiCheckCircle className="w-4 h-4" />;
      case 'On The Way':
        return <HiPlay className="w-4 h-4" />;
      case 'Completed':
        return <HiCheck className="w-4 h-4" />;
      case 'Cancelled':
        return <HiXMark className="w-4 h-4" />;
      case 'Disputed':
        return <HiExclamationTriangle className="w-4 h-4" />;
      case 'Rescheduled':
        return <HiCalendar className="w-4 h-4" />;
      default:
        return <HiCalendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground">
            {t('title')}
          </h3>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${statusBadgeClass}`}
            >
              {getStatusIcon(job.status)}
              <span className="font-semibold">{job.status}</span>
            </span>
          </div>
        </div>

        {scheduledFor && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <HiClock className="w-4 h-4" />
            <span className="text-sm">Scheduled for: {scheduledFor}</span>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="space-y-4">
        {/* Primary Actions */}
        <div className="space-y-3">
          {/* Craftsman: Change to "On The Way" */}
          {canChangeToOnTheWay && (
            <Button
              onClick={() => updateJobStatus('On The Way')}
              disabled={isUpdating}
              isLoading={isUpdating}
              loadingText={t('actions.onTheWay')}
              className="w-full flex items-center justify-center gap-3 h-12 text-base font-medium"
              size="lg"
              variant="primary"
            >
              <HiPlay className="w-5 h-5" />
              {t('actions.onTheWay')}
            </Button>
          )}

          {/* Client: Mark as Completed */}
          {canMarkCompleted && (
            <Button
              onClick={() => updateJobStatus('Completed')}
              disabled={isUpdating}
              isLoading={isUpdating}
              loadingText={t('actions.markCompleted')}
              className="w-full flex items-center justify-center gap-3 h-12 text-base font-medium bg-success text-success-foreground hover:bg-success/90"
              size="lg"
            >
              <HiCheck className="w-5 h-5" />
              {t('actions.markCompleted')}
            </Button>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="space-y-4">
          {/* Reschedule (Craftsman from "On The Way") */}
          {canReschedule && (
            <div className="space-y-3">
              {!showRescheduleInput ? (
                <Button
                  onClick={() => setShowRescheduleInput(true)}
                  disabled={isUpdating}
                  className="w-full flex items-center justify-center gap-3 h-11"
                  variant="outline"
                  size="lg"
                >
                  <HiCalendar className="w-5 h-5" />
                  {t('actions.reschedule')}
                </Button>
              ) : (
                <div className="space-y-4 bg-muted/30 border border-border rounded-lg p-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Select new date and time
                    </label>
                    <input
                      type="datetime-local"
                      value={newJobDate}
                      onChange={(e) => setNewJobDate(e.target.value)}
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => updateJobStatus('Rescheduled', newJobDate)}
                      disabled={isUpdating || !newJobDate}
                      isLoading={isUpdating}
                      loadingText={t('actions.confirm')}
                      size="default"
                      className="flex-1 h-11"
                      variant="primary"
                    >
                      {t('actions.confirm')}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowRescheduleInput(false);
                        setNewJobDate('');
                      }}
                      disabled={isUpdating}
                      variant="outline"
                      size="default"
                      className="flex-1 h-11"
                    >
                      {t('actions.cancel')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Update Job Date (Client) */}
          {canUpdateDate && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <HiClock className="w-5 h-5 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">
                  {t('updateDate.label')}
                </label>
              </div>
              <div className="flex gap-3">
                <input
                  type="datetime-local"
                  value={newJobDate}
                  onChange={(e) => setNewJobDate(e.target.value)}
                  className="flex-1 p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <Button
                  onClick={() => updateJobDate(newJobDate)}
                  disabled={isUpdating || !newJobDate}
                  isLoading={isUpdating}
                  loadingText="Update"
                  size="default"
                  className="h-11 px-6"
                  variant="primary"
                >
                  <HiClock className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('updateDate.help', {
                  defaultValue: 'Date and time are in your local timezone.',
                })}
              </p>
            </div>
          )}

          {/* Cancel Job */}
          {canCancel && (
            <Button
              onClick={() => updateJobStatus('Cancelled')}
              disabled={isUpdating}
              isLoading={isUpdating}
              loadingText={t('actions.cancelJob')}
              className="w-full flex items-center justify-center gap-3 h-11 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              variant="destructive"
            >
              <HiXMark className="w-5 h-5" />
              {t('actions.cancelJob')}
            </Button>
          )}

          {/* Leave Review (only for completed jobs) */}
          {canLeaveReview && (
            <Button
              onClick={onReviewRequest}
              className="w-full flex items-center justify-center gap-3 h-11"
              variant="primary"
            >
              <HiCheck className="w-5 h-5" />
              {t('actions.leaveReview')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
