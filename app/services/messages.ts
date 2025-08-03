import { api } from './api';
import {
  CreateChatRequest,
  SendMessageRequest,
  ChatsApiResponse,
  ChatApiResponse,
  MessagesApiResponse,
  MessageApiResponse,
} from '@/app/types/messages';

class MessageService {
  // Get user's chats
  async getChats(
    page: number = 1,
    limit: number = 20,
    token: string
  ): Promise<ChatsApiResponse> {
    try {
      const response = await api.get('/messages/chats', {
        params: { page, limit },
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch chats');
    }
  }

  // Create a new chat
  async createChat(
    data: CreateChatRequest,
    token: string
  ): Promise<ChatApiResponse> {
    try {
      const response = await api.post('/messages/chats', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create chat');
    }
  }

  // Get chat details
  async getChat(chatId: string, token: string): Promise<ChatApiResponse> {
    try {
      const response = await api.get(`/messages/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch chat');
    }
  }

  // Get chat messages
  async getChatMessages(
    chatId: string,
    page: number = 1,
    limit: number = 50,
    token: string
  ): Promise<MessagesApiResponse> {
    try {
      const response = await api.get(`/messages/chats/${chatId}/messages`, {
        params: { page, limit },
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch messages'
      );
    }
  }

  // Send message (HTTP fallback)
  async sendMessage(
    chatId: string,
    data: SendMessageRequest,
    token: string
  ): Promise<MessageApiResponse> {
    try {
      const response = await api.post(
        `/messages/chats/${chatId}/messages`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to send message'
      );
    }
  }

  // Mark messages as read
  async markMessagesAsRead(
    chatId: string,
    token: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.patch(
        `/messages/chats/${chatId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to mark messages as read'
      );
    }
  }

  // Delete message
  async deleteMessage(
    messageId: string,
    token: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/messages/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete message'
      );
    }
  }

  // Upload image for message
  async uploadMessageImage(
    file: File,
    token: string
  ): Promise<{ success: boolean; data: { url: string } }> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/messages/upload-image', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to upload image'
      );
    }
  }

  // Upload image message directly to chat (matches backend API endpoint)
  async uploadImageMessage(
    chatId: string,
    file: File,
    token: string
  ): Promise<MessageApiResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post(
        `/messages/chats/${chatId}/upload-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type manually - let browser set it with boundary
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to upload image message'
      );
    }
  }
}

export const messageService = new MessageService();
