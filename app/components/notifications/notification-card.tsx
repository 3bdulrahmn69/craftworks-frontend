import React from 'react';
import { cn } from '@/app/utils/cn';
import { Notification } from '@/app/types/notifications';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ar } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';
import {
  HiBell,
  HiExclamationTriangle,
  HiInformationCircle,
  HiXCircle,
  HiCheck,
  HiBriefcase,
  HiCurrencyDollar,
} from 'react-icons/hi2';

interface NotificationCardProps {
  notification: Notification;
  onClick?: () => void;
  onMarkAsRead?: () => void;
}

const getNotificationIcon = (type: string) => {
  const baseClass = 'h-5 w-5 flex-shrink-0';

  switch (type.toLowerCase()) {
    case 'quote':
      return (
        <HiInformationCircle
          className={cn(baseClass, 'text-[var(--color-info)]')}
        />
      );
    case 'invitation':
      return (
        <HiBell className={cn(baseClass, 'text-[var(--color-primary)]')} />
      );
    case 'job':
    case 'job_application':
      return (
        <HiBriefcase className={cn(baseClass, 'text-[var(--color-primary)]')} />
      );
    case 'status':
    case 'job_status_update':
      return (
        <HiExclamationTriangle
          className={cn(baseClass, 'text-[var(--color-warning)]')}
        />
      );
    case 'payment':
      return (
        <HiCurrencyDollar
          className={cn(baseClass, 'text-[var(--color-success)]')}
        />
      );
    case 'system':
      return (
        <HiInformationCircle
          className={cn(baseClass, 'text-[var(--color-muted-foreground)]')}
        />
      );
    case 'error':
      return (
        <HiXCircle
          className={cn(baseClass, 'text-[var(--color-destructive)]')}
        />
      );
    default:
      return (
        <HiBell className={cn(baseClass, 'text-[var(--color-primary)]')} />
      );
  }
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onClick,
  onMarkAsRead,
}) => {
  const locale = useLocale();
  const t = useTranslations('notifications');
  const isRTL = locale === 'ar';

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: locale === 'ar' ? ar : enUS,
  });

  return (
    <div
      className={cn(
        'p-4 rounded-xl transition-all duration-200 cursor-pointer relative overflow-hidden',
        'border shadow-sm hover:shadow-md',
        `${isRTL ? 'text-right' : 'text-left'}`,
        notification.read
          ? 'bg-[var(--color-muted)] border-[var(--color-border)] text-[var(--color-muted-foreground)]'
          : 'bg-[var(--color-card)] border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/30 text-[var(--color-foreground)] shadow-[var(--color-primary)]/10 hover:bg-[var(--color-accent)]/50'
      )}
      onClick={onClick}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div
          className={`absolute top-0 ${
            isRTL ? 'right-0' : 'left-0'
          } bottom-0 w-1 bg-[var(--color-primary)] rounded-${
            isRTL ? 'l' : 'r'
          }-full`}
        />
      )}

      <div
        className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        {/* Icon with theme-aware background */}
        <div
          className={cn(
            'flex items-center justify-center p-2 rounded-lg mt-0.5',
            notification.read
              ? 'bg-[var(--color-muted)]'
              : 'bg-[var(--color-primary)]/10'
          )}
        >
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div
            className={`flex justify-between items-start gap-2 ${
              isRTL ? 'flex-row-reverse' : ''
            }`}
          >
            <h3
              className={cn(
                'text-sm font-medium line-clamp-1',
                isRTL ? 'pl-6' : 'pr-6',
                !notification.read &&
                  'font-semibold text-[var(--color-foreground)]'
              )}
            >
              {notification.title}
            </h3>

            {/* Mark as Read Button - Always shown, with check when read */}
            <div className="flex items-center justify-center">
              {!notification.read ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead?.();
                  }}
                  className={cn(
                    'p-1.5 rounded-full transition-colors',
                    'bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20'
                  )}
                  title={t('card.markAsRead')}
                >
                  <HiCheck className="h-4 w-4" />
                </button>
              ) : (
                <div className="p-1.5 rounded-full bg-[var(--color-success)]/10">
                  <HiCheck className="h-4 w-4 text-[var(--color-success)]" />
                </div>
              )}
            </div>
          </div>

          <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)] line-clamp-2">
            {notification.message}
          </p>

          {/* Status Badges with theme colors */}
          <div className="mt-3 flex flex-wrap gap-2">
            {notification.data?.status && notification.type === 'status' && (
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                  notification.data.status === 'Cancelled'
                    ? 'bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]'
                    : notification.data.status === 'Completed'
                    ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                    : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                )}
              >
                {t('card.status')}: {notification.data.status}
              </span>
            )}

            {notification.data?.response &&
              notification.type === 'invitation' && (
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                    notification.data.response === 'Accepted'
                      ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                      : 'bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]'
                  )}
                >
                  {notification.data.response}
                </span>
              )}
          </div>

          {/* Date with theme colors */}
          <p
            className={cn(
              'mt-2 text-xs',
              notification.read
                ? 'text-[var(--color-muted-foreground)]'
                : 'text-[var(--color-primary)]'
            )}
          >
            {timeAgo}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
