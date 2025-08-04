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
  testConnection: () => void;
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
      console.log('🔌 Socket: No access token, skipping connection');
      return;
    }

    console.log('🚀 Socket: Initializing connection...');
    console.log(
      '🔑 Socket: Using token:',
      session.accessToken.substring(0, 20) + '...'
    );
    console.log('👤 Socket: User ID:', session.user?.id);

    const serverUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    console.log('🌐 Socket: Connecting to:', serverUrl);

    // Create socket with authentication (backend expects token without Bearer prefix)
    const newSocket = io(serverUrl, {
      auth: {
        token: session.accessToken, // Remove Bearer prefix for Socket.IO
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket: Connected successfully!');
      console.log('🆔 Socket: Socket ID:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('🚫 Socket: Connection failed');
      console.error('❌ Error:', error);
      console.error('🔍 Error message:', error.message);
      console.error('🔍 Error type:', error.type);
      setIsConnected(false);
    });

    newSocket.on('disconnect', (reason: string) => {
      console.log('❌ Socket: Disconnected');
      console.log('📝 Reason:', reason);
      setIsConnected(false);
    });

    // Message events
    newSocket.on('new-message', (message: Message) => {
      console.log('📨 Socket: New message received:', message);
      callbacksRef.current.onNewMessage?.(message);
    });

    newSocket.on(
      'message-read',
      (data: { chatId: string; messageId: string; readBy: string }) => {
        console.log('📖 Socket: Message read:', data);
        callbacksRef.current.onMessageRead?.(data);
      }
    );

    newSocket.on('chat-updated', (chat: any) => {
      console.log('💬 Socket: Chat updated:', chat);
      callbacksRef.current.onChatUpdated?.(chat);
    });

    newSocket.on('user-typing', (data: TypingIndicator) => {
      console.log('⌨️ Socket: User typing:', data);
      setTypingUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== data.userId);
        return data.isTyping ? [...filtered, data] : filtered;
      });
    });

    // Listen for Socket.IO errors
    newSocket.on('error', (error: any) => {
      console.error('🚨 Socket Error:', error);
    });

    // Listen for message sent confirmation
    newSocket.on('message-sent', (data: any) => {
      console.log('✅ Message sent confirmation:', data);
    });

    // Listen for message error
    newSocket.on('message-error', (error: any) => {
      console.error('❌ Message Error:', error);
    });

    // Listen for chat join confirmation
    newSocket.on('chat-joined', (data: any) => {
      console.log('✅ Successfully joined chat:', data);
    });

    setSocket(newSocket);

    return () => {
      console.log('🧹 Socket: Cleaning up connection');
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [session?.accessToken, session?.user?.id]);

  // Socket functions
  const sendMessage = (data: {
    chatId: string;
    content: string;
    messageType?: 'text' | 'image';
  }) => {
    if (socket && isConnected) {
      console.log('📤 Socket: Sending message:', data);
      socket.emit('send-message', data);
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
      socket.emit('typing-start', chatId);
    }
  };

  const stopTyping = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('typing-stop', chatId);
    }
  };

  const markAsRead = (chatId: string) => {
    if (socket && isConnected) {
      console.log('📖 Socket: Marking messages as read for chat:', chatId);
      socket.emit('mark-messages-read', chatId);
    }
  };

  // Test function to verify socket communication
  const testConnection = () => {
    if (socket && isConnected) {
      console.log('🧪 Testing socket connection...');
      socket.emit('test-connection', { timestamp: Date.now() });
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
    testConnection,
  };
};
