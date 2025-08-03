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
  const [typingUsers] = useState<TypingIndicator[]>([]);
  const [onlineUsers] = useState<OnlineStatus>({});

  // Store callbacks in refs to avoid dependency issues
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

  // Initialize socket connection
  useEffect(() => {
    if (!session?.accessToken) {
      console.log('🔌 Socket Debug: No access token, skipping connection');
      return;
    }

    const initializeSocket = async () => {
      console.log('🚀 Socket Debug: Initializing connection...');
      console.log(
        '🔑 Socket Debug: Using token:',
        session.accessToken.substring(0, 20) + '...'
      );
      console.log('👤 Socket Debug: User ID:', session.user?.id);

      const serverUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
      console.log('🌐 Socket Debug: Connecting to:', serverUrl);

      // Test basic Socket.IO connectivity first
      try {
        const testResponse = await fetch(
          `${serverUrl}/socket.io/?EIO=4&transport=polling`
        );
        console.log(
          '🧪 Socket Debug: Basic connectivity test status:',
          testResponse.status
        );
        const testText = await testResponse.text();
        console.log(
          '🧪 Socket Debug: Basic response:',
          testText.substring(0, 100)
        );
      } catch (testError) {
        console.error(
          '🧪❌ Socket Debug: Basic connectivity test failed:',
          testError
        );
      }

      // Try connecting without authentication first to test namespace
      console.log('🔧 Socket Debug: Testing connection without auth...');
      const testSocket = io(serverUrl, {
        transports: ['polling'], // Start with polling only
        reconnection: false, // Disable reconnection for test
        timeout: 5000,
      });

      testSocket.on('connect', () => {
        console.log('✅ Socket Debug: Test connection successful!');
        console.log('🆔 Socket Debug: Test Socket ID:', testSocket.id);
        testSocket.disconnect();

        // Now try with authentication
        console.log('🔐 Socket Debug: Starting authenticated connection...');
        const authenticatedSocket = io(serverUrl, {
          auth: {
            token: `Bearer ${session.accessToken}`,
          },
          transportOptions: {
            polling: {
              extraHeaders: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            },
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 1000,
          timeout: 10000,
        });

        // Set up authenticated socket events
        authenticatedSocket.on('connect', () => {
          console.log('✅ Socket Debug: Authenticated connection successful!');
          console.log(
            '🆔 Socket Debug: Authenticated Socket ID:',
            authenticatedSocket.id
          );
          setIsConnected(true);
          setSocket(authenticatedSocket);
        });

        authenticatedSocket.on('connect_error', (error: any) => {
          console.error('🚫 Socket Debug: Authenticated connection error');
          console.error('❌ Error details:', error);
          console.error('🔍 Error message:', error.message);
          console.error('🔍 Error type:', error.type);
          console.error('🔍 Error data:', error.data);
          setIsConnected(false);
        });

        authenticatedSocket.on('disconnect', (reason: string) => {
          console.log('❌ Socket Debug: Authenticated socket disconnected');
          console.log('📝 Reason:', reason);
          setIsConnected(false);
        });

        // Message events
        authenticatedSocket.on('new-message', (message: Message) => {
          console.log('📨 Socket Debug: New message received:', message);
          callbacksRef.current.onNewMessage?.(message);
        });

        authenticatedSocket.on(
          'message-read',
          (data: { chatId: string; messageId: string; readBy: string }) => {
            console.log('📖 Socket Debug: Message read:', data);
            callbacksRef.current.onMessageRead?.(data);
          }
        );

        authenticatedSocket.on('chat-updated', (chat: any) => {
          console.log('💬 Socket Debug: Chat updated:', chat);
          callbacksRef.current.onChatUpdated?.(chat);
        });

        // Store the authenticated socket
        setSocket(authenticatedSocket);
      });

      testSocket.on('connect_error', (error: any) => {
        console.error('🚫 Socket Debug: Test connection failed');
        console.error('❌ Error details:', error);
        console.error('🔍 Error message:', error.message);
        console.error('🔍 Error type:', error.type);
        console.error('🔍 Error description:', error.description);
        console.error('🔍 Error context:', error.context);
        console.error('🔍 Full error object:', JSON.stringify(error, null, 2));

        // Check if it's a namespace issue
        if (error.message === 'Invalid namespace') {
          console.error('📍 Socket Debug: NAMESPACE ISSUE DETECTED!');
          console.error(
            '📍 This means the Socket.IO server is not configured for the default namespace'
          );
          console.error(
            '📍 Check backend Socket.IO setup for namespace configuration'
          );
        }

        setIsConnected(false);
      });
    };

    initializeSocket();

    return () => {
      console.log('🧹 Socket Debug: Cleaning up connection');
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setIsConnected(false);
    };
  }, [session?.accessToken, session?.user?.id, socket]);

  // Socket functions
  const sendMessage = (data: {
    chatId: string;
    content: string;
    messageType?: 'text' | 'image';
  }) => {
    if (socket && isConnected) {
      console.log('📤 Socket Debug: Sending message:', data);
      socket.emit('send-message', data);
    } else {
      console.warn('⚠️ Socket Debug: Cannot send message - not connected');
    }
  };

  const joinChat = (chatId: string) => {
    if (socket && isConnected) {
      console.log('🏠 Socket Debug: Joining chat:', chatId);
      socket.emit('join-chat', chatId);
    } else {
      console.warn('⚠️ Socket Debug: Cannot join chat - not connected');
    }
  };

  const leaveChat = (chatId: string) => {
    if (socket && isConnected) {
      console.log('🚪 Socket Debug: Leaving chat:', chatId);
      socket.emit('leave-chat', chatId);
    } else {
      console.warn('⚠️ Socket Debug: Cannot leave chat - not connected');
    }
  };

  const startTyping = (chatId: string) => {
    if (socket && isConnected) {
      console.log('✍️ Socket Debug: Start typing in chat:', chatId);
      socket.emit('typing-start', chatId);
    }
  };

  const stopTyping = (chatId: string) => {
    if (socket && isConnected) {
      console.log('✋ Socket Debug: Stop typing in chat:', chatId);
      socket.emit('typing-stop', chatId);
    }
  };

  const markAsRead = (chatId: string) => {
    if (socket && isConnected) {
      console.log('📖 Socket Debug: Mark as read for chat:', chatId);
      socket.emit('mark-read', chatId);
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
