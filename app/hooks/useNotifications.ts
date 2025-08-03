import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { notificationService } from '@/app/services/notifications';
import { Notification } from '@/app/types/notifications';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const useNotifications = (
  autoFetch: boolean = true,
  limit: number = 5
): UseNotificationsReturn => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!session?.accessToken || !autoFetch) return;

    try {
      setLoading(true);
      setError(null);

      const response = await notificationService.getNotifications(
        session.accessToken,
        1,
        limit
      );

      setNotifications(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      setError(error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, autoFetch, limit]);

  useEffect(() => {
    if (session?.accessToken && autoFetch) {
      fetchNotifications();
    }
  }, [session?.accessToken, autoFetch, fetchNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!session?.accessToken) return;

      try {
        await notificationService.markNotificationAsRead(
          session.accessToken,
          notificationId
        );

        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      } catch (error: any) {
        console.error('Failed to mark notification as read:', error);
        throw error;
      }
    },
    [session?.accessToken]
  );

  const markAllAsRead = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      await notificationService.markAllNotificationsAsRead(session.accessToken);

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }, [session?.accessToken]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };
};
