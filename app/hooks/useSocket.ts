'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { Message, TypingIndicator, OnlineStatus } from '@/app/types/messages';

interface UseSocketReturn {
  socket: typeof Socket | null;
  isConnected: boolean;
  typingUsers: TypingIndicator[];
  onlineUsers: OnlineStatus;
  sendMessage: (data: {
    chatId: string;
    content: string;
    messageType?: 'text' | 'image';
  }) => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  startTyping: (chatId: string) => void;
  stopTyping: (chatId: string) => void;
  markAsRead: (chatId: string) => void;
}

export const useSocket = (
  onNewMessage?: (message: Message) => void,
  onMessageRead?: (data: {
    chatId: string;
    messageId: string;
    readBy: string;
  }) => void,
  onChatUpdated?: (chat: any) => void
): UseSocketReturn => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineStatus>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use refs to store callbacks and avoid dependency issues
  const callbacksRef = useRef({
    onNewMessage,
    onMessageRead,
    onChatUpdated,
  });

  // Update callback refs when props change
  useEffect(() => {
    callbacksRef.current = {
      onNewMessage,
      onMessageRead,
      onChatUpdated,
    };
  }, [onNewMessage, onMessageRead, onChatUpdated]);

  useEffect(() => {
    if (!session?.accessToken) {
      console.log('🔌 Socket: No access token, skipping connection');
      return;
    }

    const initializeSocket = async () => {
      console.log('🚀 Socket: Initializing connection...');
      console.log(
        '🔑 Socket: Using token:',
        session.accessToken.substring(0, 20) + '...'
      );

      const serverUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
      console.log('🌐 Socket: Connecting to:', serverUrl);
      console.log('🔧 Socket: Full URL will be:', `${serverUrl}/socket.io/`);

      // Test basic connectivity first
      try {
        const testResponse = await fetch(
          `${serverUrl}/socket.io/?EIO=4&transport=polling`
        );
        console.log(
          '🧪 Socket: Basic connectivity test status:',
          testResponse.status
        );
      } catch (testError) {
        console.error(
          '🧪❌ Socket: Basic connectivity test failed:',
          testError
        );
      }

      const socketInstance = io(serverUrl, {
        auth: {
          token: session.accessToken,
          userId: session.user?.id,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true,
      });

      console.log('⚙️ Socket: Configuration applied');
      console.log('👤 User ID:', session.user?.id);
      console.log('🔗 Transport modes: websocket, polling');

      // Connection events with detailed logging
      socketInstance.on('connect', () => {
        console.log('✅ Socket: Connected successfully!');
        console.log('🆔 Socket ID:', socketInstance.id);
        setIsConnected(true);
      });

      socketInstance.on('disconnect', (reason: string) => {
        console.log('❌ Socket: Disconnected');
        console.log('📝 Reason:', reason);
        setIsConnected(false);
        setTypingUsers([]);
        setOnlineUsers({});
      });

      socketInstance.on('connect_error', (error: any) => {
        console.error('🚫 Socket: Connection error');
        console.error('❌ Error details:', error);
        console.error('🔍 Error message:', error.message);
        console.error('🔍 Error type:', error.type);
        setIsConnected(false);
      });

      socketInstance.on('reconnect', (attemptNumber: number) => {
        console.log('🔄 Socket: Reconnected on attempt', attemptNumber);
      });

      socketInstance.on('reconnect_attempt', (attemptNumber: number) => {
        console.log('🔄 Socket: Reconnection attempt', attemptNumber);
      });

      socketInstance.on('reconnect_error', (error: any) => {
        console.error('🔄❌ Socket: Reconnection error:', error);
      });

      socketInstance.on('reconnect_failed', () => {
        console.error('🔄💀 Socket: Reconnection failed after all attempts');
      });

      // Message events with debugging
      socketInstance.on('new-message', (message: Message) => {
        console.log('📨 Socket: New message received');
        console.log('📝 Message data:', message);
        callbacksRef.current.onNewMessage?.(message);
      });

      socketInstance.on(
        'message-read',
        (data: { chatId: string; messageId: string; readBy: string }) => {
          console.log('👁️ Socket: Message read event');
          console.log('📝 Read data:', data);
          callbacksRef.current.onMessageRead?.(data);
        }
      );

      // Typing events with debugging
      socketInstance.on(
        'user-typing',
        (data: {
          chatId: string;
          userId: string;
          userName: string;
          isTyping: boolean;
        }) => {
          console.log('⌨️ Socket: Typing event');
          console.log('📝 Typing data:', data);
          setTypingUsers((prev) => {
            const filtered = prev.filter(
              (user) =>
                user.userId !== data.userId || user.chatId !== data.chatId
            );
            if (data.isTyping) {
              return [
                ...filtered,
                {
                  chatId: data.chatId,
                  userId: data.userId,
                  userName: data.userName,
                  isTyping: true,
                },
              ];
            }
            return filtered;
          });
        }
      );

      // Online status events with debugging
      socketInstance.on('user-online', (userId: string) => {
        console.log('🟢 Socket: User online:', userId);
        setOnlineUsers((prev) => ({ ...prev, [userId]: true }));
      });

      socketInstance.on('user-offline', (userId: string) => {
        console.log('🔴 Socket: User offline:', userId);
        setOnlineUsers((prev) => ({ ...prev, [userId]: false }));
      });

      // Chat events with debugging
      socketInstance.on('chat-updated', (chat: any) => {
        console.log('💬 Socket: Chat updated');
        console.log('📝 Chat data:', chat);
        callbacksRef.current.onChatUpdated?.(chat);
      });

      // Error events with debugging
      socketInstance.on(
        'error',
        (error: { message: string; code?: string }) => {
          console.error('🚫 Socket: Server error');
          console.error('❌ Error details:', error);
        }
      );

      setSocket(socketInstance);

      return () => {
        console.log('🧹 Socket: Cleaning up connection');
        socketInstance.disconnect();
      };
    };

    initializeSocket();
  }, [session?.accessToken, session?.user?.id]); // Include user ID dependency

  const sendMessage = (data: {
    chatId: string;
    content: string;
    messageType?: 'text' | 'image';
  }) => {
    if (socket && isConnected) {
      console.log('📤 Socket: Sending message');
      console.log('📝 Message data:', data);
      socket.emit('send-message', {
        chatId: data.chatId,
        content: data.content,
        messageType: data.messageType || 'text',
      });
    } else {
      console.warn('⚠️ Socket: Cannot send message - not connected');
    }
  };

  const joinChat = (chatId: string) => {
    if (socket && isConnected) {
      console.log('🚪 Socket: Joining chat:', chatId);
      socket.emit('join-chat', chatId);
    } else {
      console.warn('⚠️ Socket: Cannot join chat - not connected');
    }
  };

  const leaveChat = (chatId: string) => {
    if (socket && isConnected) {
      console.log('🚪 Socket: Leaving chat:', chatId);
      socket.emit('leave-chat', chatId);
    } else {
      console.warn('⚠️ Socket: Cannot leave chat - not connected');
    }
  };

  const startTyping = (chatId: string) => {
    if (socket && isConnected) {
      console.log('⌨️ Socket: Start typing in chat:', chatId);
      socket.emit('typing-start', chatId);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Auto-stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(chatId);
      }, 3000);
    } else {
      console.warn('⚠️ Socket: Cannot start typing - not connected');
    }
  };

  const stopTyping = (chatId: string) => {
    if (socket && isConnected) {
      console.log('⌨️ Socket: Stop typing in chat:', chatId);
      socket.emit('typing-stop', chatId);

      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    } else {
      console.warn('⚠️ Socket: Cannot stop typing - not connected');
    }
  };

  const markAsRead = (chatId: string) => {
    if (socket && isConnected) {
      console.log('👁️ Socket: Marking messages as read in chat:', chatId);
      socket.emit('mark-messages-read', chatId); // Fixed: use correct event name from backend
    } else {
      console.warn('⚠️ Socket: Cannot mark as read - not connected');
    }
  };

  return {
    socket,
    isConnected,
    typingUsers,
    onlineUsers,
    sendMessage,
    joinChat,
    leaveChat,
    startTyping,
    stopTyping,
    markAsRead,
  };
};
