import { api } from './api';
import type {
  NotificationResponse,
  MarkReadRequest,
  MarkReadResponse,
} from '@/app/types/notifications';

class NotificationService {
  /**
   * Get all notifications for the current user
   */
  async getNotifications(
    token: string,
    page: number = 1,
    limit: number = 20
  ): Promise<NotificationResponse> {
    try {
      const response = await api.get('/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          limit,
        },
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch notifications'
        );
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      throw new Error(error.message || 'Failed to fetch notifications');
    }
  }

  /**
   * Mark notifications as read
   */
  async markNotificationsAsRead(
    token: string,
    notificationIds?: string[]
  ): Promise<MarkReadResponse> {
    try {
      const requestData: MarkReadRequest = {};
      if (notificationIds && notificationIds.length > 0) {
        requestData.notificationIds = notificationIds;
      }

      const response = await api.post('/notifications/mark-read', requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || 'Failed to mark notifications as read'
        );
      }
    } catch (error: any) {
      console.error('Error marking notifications as read:', error);
      throw new Error(error.message || 'Failed to mark notifications as read');
    }
  }

  /**
   * Mark a single notification as read
   */
  async markNotificationAsRead(
    token: string,
    notificationId: string
  ): Promise<MarkReadResponse> {
    return this.markNotificationsAsRead(token, [notificationId]);
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(token: string): Promise<MarkReadResponse> {
    return this.markNotificationsAsRead(token);
  }
}

export const notificationService = new NotificationService();
