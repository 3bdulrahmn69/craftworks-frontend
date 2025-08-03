'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { notificationService } from '@/app/services/notifications';
import { Notification, NotificationResponse } from '@/app/types/notifications';
import Container from '@/app/components/ui/container';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import Button from '@/app/components/ui/button';
import NotificationCard from './notification-card';
import PaginationComponent from '@/app/components/ui/pagination-component';
import { HiBell, HiCheckCircle, HiArrowPath } from 'react-icons/hi2';
import { toast } from 'react-toastify';

interface NotificationsPageProps {
  title: string;
  userType: 'client' | 'craftsman';
}

type FilterType = 'all' | 'unread' | 'read';

const NotificationsPage: React.FC<NotificationsPageProps> = ({ userType }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations('notifications');

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    totalItems: 0,
  });

  const fetchNotifications = React.useCallback(
    async (
      page: number = 1,
      limit: number = 20,
      isRefresh: boolean = false
    ) => {
      if (!session?.accessToken) return;

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const response: NotificationResponse =
          await notificationService.getNotifications(
            session.accessToken,
            page,
            limit
          );

        setNotifications(response.data.data);
        setPagination(response.data.pagination);

        if (isRefresh) {
          toast.success(
            t('actions.refreshSuccess') || 'Notifications refreshed'
          );
        }
      } catch (error: any) {
        console.error('Failed to fetch notifications:', error);
        setError(error.message || t('error.title'));
        toast.error(t('error.title'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session?.accessToken, t]
  );

  useEffect(() => {
    if (session?.accessToken) {
      fetchNotifications(1, 20);
    }
  }, [session?.accessToken, fetchNotifications]);

  const handleRefresh = () => {
    fetchNotifications(pagination.page, pagination.limit, true);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!session?.accessToken) return;

    try {
      await notificationService.markNotificationAsRead(
        session.accessToken,
        notificationId
      );

      // Update the notification in the local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
      toast.error(
        t('error.markReadFailed') || 'Failed to mark notification as read'
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!session?.accessToken) return;

    try {
      setMarkingAllAsRead(true);

      await notificationService.markAllNotificationsAsRead(session.accessToken);

      // Update all notifications in the local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );

      toast.success(
        t('actions.markAllReadSuccess') || 'All notifications marked as read'
      );
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error(
        t('error.markAllReadFailed') ||
          'Failed to mark all notifications as read'
      );
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchNotifications(newPage, 20);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }

    // Enhanced navigation based on notification type, data, and user type
    if (notification.data?.jobId) {
      const jobId = notification.data.jobId;

      switch (notification.type) {
        case 'quote':
          if (userType === 'client') {
            // Client: Navigate to job applications to see quotes/applications
            router.push(`/sc/jobs/${jobId}/applications`);
          } else {
            // Craftsman: Navigate to quotes page to see their submitted quotes
            router.push(`/sm/quotes`);
          }
          break;

        case 'invitation':
          if (userType === 'craftsman') {
            // Craftsman: Navigate to invitations page
            router.push(`/sm/invitations`);
          } else {
            // Client: Navigate to job-manager to manage invitations and jobs
            router.push(`/sc/job-manager`);
          }
          break;

        case 'status':
          if (userType === 'client') {
            // Client: Navigate to my-jobs to see job status updates
            router.push(`/sc/my-jobs`);
          } else {
            // Craftsman: Navigate to jobs list to see their work
            router.push(`/sm/jobs`);
          }
          break;

        case 'job':
          // General job-related notifications
          if (userType === 'client') {
            router.push(`/sc/my-jobs`);
          } else {
            router.push(`/sm/jobs`);
          }
          break;

        case 'payment':
          // Payment notifications - navigate to relevant sections
          if (userType === 'client') {
            router.push(`/sc/my-jobs`); // Clients can see payment status in my-jobs
          } else {
            router.push(`/sm/jobs`); // Craftsmen can see payment status in their jobs
          }
          break;

        default:
          // Default fallback navigation
          if (userType === 'client') {
            router.push(`/sc/jobs`);
          } else {
            router.push(`/sm/jobs`);
          }
      }
    } else {
      // Fallback navigation for notifications without job data
      switch (notification.type) {
        case 'system':
        case 'error':
          // System notifications - go to settings or stay on notifications
          router.push(`/settings`);
          break;
        case 'invitation':
          // Invitation without job data
          if (userType === 'craftsman') {
            router.push(`/sm/invitations`);
          } else {
            router.push(`/sc/job-manager`);
          }
          break;
        case 'quote':
          // Quote without job data
          if (userType === 'craftsman') {
            router.push(`/sm/quotes`);
          } else {
            router.push(`/sc/job-manager`);
          }
          break;
        default:
          if (userType === 'client') {
            router.push(`/sc/jobs`);
          } else {
            router.push(`/sm/jobs`);
          }
      }
    }
  };

  // Filter notifications based on the selected filter
  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'all':
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalCount = notifications.length;

  const getFilteredCount = (filterType: FilterType) => {
    switch (filterType) {
      case 'unread':
        return unreadCount;
      case 'all':
      default:
        return totalCount;
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <Container className="py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-[color:var(--color-text-muted)]">
              {t('loading.title')}
            </p>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              {t('loading.message')}
            </p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-[color:var(--color-primary)]/10">
              <HiBell className="h-8 w-8 text-[color:var(--color-primary)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[color:var(--color-text)]">
                {t('title')}
              </h1>
              <p className="text-[color:var(--color-text-muted)] mt-1">
                {t('subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Refresh Button */}
            <Button
              onClick={handleRefresh}
              isLoading={refreshing}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <HiArrowPath
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              />
              <span>
                {refreshing ? t('actions.refreshing') : t('actions.refresh')}
              </span>
            </Button>

            {/* Mark All as Read Button */}
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                isLoading={markingAllAsRead}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <HiCheckCircle className="h-4 w-4" />
                <span>
                  {t('actions.markAllRead')} ({unreadCount})
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Compact Filters */}
        <div className="bg-[color:var(--color-card)] border border-[color:var(--color-border)] rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {(['all', 'unread'] as FilterType[]).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`
          px-3 py-1.5 rounded-md text-xs font-medium transition-colors
          ${
            filter === filterType
              ? 'bg-[color:var(--color-primary)] text-white'
              : 'bg-[color:var(--color-muted)] text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-muted)]/80'
          }`}
              >
                {t('filters.' + filterType)}{' '}
                <span className="font-bold">
                  ({getFilteredCount(filterType)})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-[color:var(--color-destructive)]/10 border border-[color:var(--color-destructive)]/20 rounded-lg p-4 mb-6">
            <p className="text-[color:var(--color-destructive)]">{error}</p>
            <Button
              onClick={() => fetchNotifications(pagination.page, 20)}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              {t('error.retry')}
            </Button>
          </div>
        )}

        {/* Notifications List */}
        {filteredNotifications.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="p-6 rounded-full bg-[color:var(--color-muted)] w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <HiBell className="h-12 w-12 text-[color:var(--color-text-muted)]" />
            </div>
            <h3 className="text-lg font-medium text-[color:var(--color-text)] mb-2">
              {filter === 'all'
                ? t('empty.noNotifications.title')
                : filter === 'unread'
                ? t('empty.noUnread.title')
                : t('empty.noRead.title')}
            </h3>
            <p className="text-[color:var(--color-text-muted)]">
              {filter === 'all'
                ? t('empty.noNotifications.message')
                : filter === 'unread'
                ? t('empty.noUnread.message')
                : t('empty.noRead.message')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                onMarkAsRead={() => handleMarkAsRead(notification._id)}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <PaginationComponent
              pagination={{
                currentPage: pagination.page,
                totalPages: pagination.totalPages,
                totalItems: pagination.totalItems,
                itemsPerPage: pagination.limit,
                hasNext: pagination.page < pagination.totalPages,
                hasPrev: pagination.page > 1,
              }}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </Container>
  );
};

export default NotificationsPage;
