'use client';

import { useNotifications } from '@/app/hooks/useNotifications';
import NotificationsPageEnhanced from '@/app/components/notifications/notifications-page-enhanced';

const ClientNotifications = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications(true, 50); // Fetch more notifications for the page

  return (
    <NotificationsPageEnhanced
      notifications={notifications}
      loading={loading}
      error={error}
      unreadCount={unreadCount}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onRefresh={refreshNotifications}
      isRefreshing={false} // You can add separate refreshing state if needed
    />
  );
};

export default ClientNotifications;
