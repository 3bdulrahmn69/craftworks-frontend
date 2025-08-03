import React from 'react';
import { useNotifications } from '@/app/hooks/useNotifications';
import { HiBell, HiExclamationCircle } from 'react-icons/hi2';
import { cn } from '@/app/utils/cn';
import Link from 'next/link';

interface NotificationSummaryProps {
  userType: 'client' | 'craftsman';
  className?: string;
  maxItems?: number;
}

export const NotificationSummary: React.FC<NotificationSummaryProps> = ({
  userType,
  className,
  maxItems = 3,
}) => {
  const { notifications, unreadCount, loading, error } = useNotifications(
    true,
    maxItems
  );

  if (loading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'text-red-600 text-sm flex items-center space-x-1',
          className
        )}
      >
        <HiExclamationCircle className="h-4 w-4" />
        <span>Failed to load notifications</span>
      </div>
    );
  }

  const notificationPath =
    userType === 'client' ? '/sc/notifications' : '/sm/notifications';

  return (
    <div className={cn('bg-white rounded-lg border p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <HiBell className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Recent Notifications</h3>
        </div>
        {unreadCount > 0 && (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
            {unreadCount} new
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm">No recent notifications</p>
      ) : (
        <div className="space-y-2">
          {notifications.slice(0, maxItems).map((notification) => (
            <div
              key={notification._id}
              className={cn(
                'p-2 rounded border-l-4 text-sm',
                notification.read
                  ? 'bg-gray-50 border-l-gray-300'
                  : 'bg-blue-50 border-l-blue-500'
              )}
            >
              <h4 className="font-medium text-gray-900 truncate">
                {notification.title}
              </h4>
              <p className="text-gray-600 text-xs truncate">
                {notification.message}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t">
        <Link
          href={notificationPath}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View all notifications →
        </Link>
      </div>
    </div>
  );
};

export default NotificationSummary;
