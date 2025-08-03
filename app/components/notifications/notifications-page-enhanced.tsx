import React, { useState, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/app/utils/cn';
import { Notification } from '@/app/types/notifications';
import NotificationCard from './notification-card';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import Button from '@/app/components/ui/button';
import DropdownSelector from '@/app/components/ui/dropdown-selector';
import Container from '@/app/components/ui/container';
import {
  HiBell,
  HiArrowPath,
  HiCheck,
  HiEye,
  HiEyeSlash,
  HiAdjustmentsHorizontal,
} from 'react-icons/hi2';

interface NotificationsPageEnhancedProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

type FilterType = 'all' | 'unread' | 'read';

export const NotificationsPageEnhanced: React.FC<
  NotificationsPageEnhancedProps
> = ({
  notifications,
  loading,
  error,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onRefresh,
  isRefreshing = false,
}) => {
  const locale = useLocale();
  const t = useTranslations('notifications');
  const isRTL = locale === 'ar';

  const [filter, setFilter] = useState<FilterType>('all');

  // Filter options for dropdown
  const filterOptions = [
    { id: 'all', label: t('filters.all') },
    { id: 'unread', label: t('filters.unread') },
    { id: 'read', label: t('filters.read') },
  ];

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'read':
        return notification.read;
      default:
        return true;
    }
  });

  const handleFilterChange = useCallback((value: string) => {
    setFilter(value as FilterType);
  }, []);

  const handleRefresh = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  if (loading && notifications.length === 0) {
    return (
      <Container className={`py-8 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
              {t('loading.title')}
            </h3>
            <p className="text-[var(--color-muted-foreground)]">
              {t('loading.message')}
            </p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={`py-8 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
              {t('error.title')}
            </h3>
            <p className="text-[var(--color-muted-foreground)] mb-4">{error}</p>
            <Button onClick={handleRefresh}>{t('error.retry')}</Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className={`py-8 max-w-4xl ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--color-primary)]/5 to-[var(--color-primary)]/5 rounded-xl p-6 border border-[var(--color-primary)]/20 shadow-lg">
          <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${
              isRTL ? 'lg:flex-row-reverse' : ''
            }`}
          >
            <div
              className={`flex items-center gap-4 ${
                isRTL ? 'flex-row-reverse' : ''
              }`}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)]/80 rounded-xl flex items-center justify-center shadow-xl">
                <HiBell className="text-white w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--color-primary)]">
                  {t('title')}
                </h1>
                <p className="text-[var(--color-muted-foreground)] mt-1">
                  {t('subtitle')}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div
              className={`grid grid-cols-2 gap-4 ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              <div className="bg-[var(--color-card)]/70 backdrop-blur-sm rounded-lg p-3 border border-[var(--color-primary)]/20 shadow-md">
                <div className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wide font-medium mb-1">
                  {t('stats.total')}
                </div>
                <div className="text-2xl font-bold text-[var(--color-primary)]">
                  {notifications.length}
                </div>
              </div>
              <div className="bg-[var(--color-card)]/70 backdrop-blur-sm rounded-lg p-3 border border-[var(--color-primary)]/20 shadow-md">
                <div className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wide font-medium mb-1">
                  {t('stats.unread')}
                </div>
                <div className="text-2xl font-bold text-[var(--color-primary)]">
                  {unreadCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 shadow-sm">
          <div
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isRTL ? 'sm:flex-row-reverse' : ''
            }`}
          >
            {/* Filter Dropdown */}
            <div
              className={`flex items-center gap-3 ${
                isRTL ? 'flex-row-reverse' : ''
              }`}
            >
              <HiAdjustmentsHorizontal className="w-5 h-5 text-[var(--color-primary)]" />
              <DropdownSelector
                id="notification-filter"
                label=""
                options={filterOptions}
                value={filter}
                onChange={handleFilterChange}
                placeholder={t('filters.placeholder')}
                className="min-w-[160px]"
              />
            </div>

            {/* Action Buttons */}
            <div
              className={`flex items-center gap-2 ${
                isRTL ? 'flex-row-reverse' : ''
              }`}
            >
              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-[var(--color-primary)]/30 hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/10"
              >
                <HiArrowPath
                  className={cn(
                    'w-4 h-4',
                    isRefreshing && 'animate-spin',
                    isRTL ? 'ml-2' : 'mr-2'
                  )}
                />
                {isRefreshing ? t('actions.refreshing') : t('actions.refresh')}
              </Button>

              {/* Mark All as Read */}
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  onClick={onMarkAllAsRead}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
                >
                  <HiCheck className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {t('actions.markAllRead')}
                </Button>
              )}
            </div>
          </div>

          {/* Filter Summary */}
          <div
            className={`mt-3 text-sm text-[var(--color-muted-foreground)] ${
              isRTL ? 'text-right' : 'text-left'
            }`}
          >
            {filter === 'all' && (
              <>
                <HiEye className="inline w-4 h-4 mr-1" />
                {t('filters.showing.all', {
                  count: filteredNotifications.length,
                })}
              </>
            )}
            {filter === 'unread' && (
              <>
                <HiEyeSlash className="inline w-4 h-4 mr-1" />
                {t('filters.showing.unread', {
                  count: filteredNotifications.length,
                })}
              </>
            )}
            {filter === 'read' && (
              <>
                <HiCheck className="inline w-4 h-4 mr-1" />
                {t('filters.showing.read', {
                  count: filteredNotifications.length,
                })}
              </>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)]">
              <HiBell className="w-16 h-16 text-[var(--color-muted-foreground)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
                {filter === 'unread'
                  ? t('empty.noUnread.title')
                  : filter === 'read'
                  ? t('empty.noRead.title')
                  : t('empty.noNotifications.title')}
              </h3>
              <p className="text-[var(--color-muted-foreground)]">
                {filter === 'unread'
                  ? t('empty.noUnread.message')
                  : filter === 'read'
                  ? t('empty.noRead.message')
                  : t('empty.noNotifications.message')}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                notification={notification}
                onMarkAsRead={() => onMarkAsRead(notification._id)}
              />
            ))
          )}
        </div>

        {/* Loading overlay for refresh */}
        {isRefreshing && notifications.length > 0 && (
          <div className="fixed top-20 right-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-3 shadow-lg z-50">
            <div
              className={`flex items-center gap-2 ${
                isRTL ? 'flex-row-reverse' : ''
              }`}
            >
              <LoadingSpinner size="sm" />
              <span className="text-sm text-[var(--color-foreground)]">
                {t('actions.refreshing')}
              </span>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default NotificationsPageEnhanced;
