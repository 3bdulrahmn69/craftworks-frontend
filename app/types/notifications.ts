export interface Notification {
  _id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  data?: {
    jobId?: string;
    quoteId?: string;
    craftsmanId?: string;
    invitationId?: string;
    status?: string;
    response?: string;
    [key: string]: any; // Allow for additional properties
  };
  read: boolean;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    data: Notification[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalItems: number;
    };
  };
  message: string;
}

export interface MarkReadRequest {
  notificationIds?: string[];
}

export interface MarkReadResponse {
  success: boolean;
  message: string;
}
