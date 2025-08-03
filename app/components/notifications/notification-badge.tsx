import React from 'react';
import { HiBell } from 'react-icons/hi2';
import { cn } from '@/app/utils/cn';
import { useNotifications } from '@/app/hooks/useNotifications';

interface NotificationBadgeProps {
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  className,
  iconSize = 'md',
  onClick,
}) => {
  const { unreadCount, loading } = useNotifications(true, 10);

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative p-2 text-gray-600 hover:text-gray-900 transition-colors',
        className
      )}
      aria-label={`Notifications${
        unreadCount > 0 ? ` (${unreadCount} unread)` : ''
      }`}
    >
      <HiBell className={iconSizes[iconSize]} />

      {!loading && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBadge;
