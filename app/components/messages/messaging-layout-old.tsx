'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Chat, Message } from '@/app/types/messages';
import { messageService } from '@/app/services/messages';
import { useSocket } from '@/app/hooks/useSocket-simple';
import ImageModal from '@/app/components/ui/image-modal';

interface MessagingLayoutProps {
  initialChatId?: string;
}

const MessagingLayout: React.FC<MessagingLayoutProps> = ({ initialChatId }) => {
  const { data: session } = useSession();

  // State management
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Ref to track selected chat for socket callbacks
  const selectedChatRef = useRef<Chat | null>(null);

  // Update ref when selectedChat changes
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Socket.IO integration with message handler - backend auto-joins users
  const {
    isConnected,
    sendMessage: socketSendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    typingUsers,
  } = useSocket(
    // onNewMessage callback
    (newMessage: any) => {
      console.log('📨 New message received via Socket.IO:', newMessage);

      // Transform the message format - backend sends senderId as populated object
      let transformedMessage = newMessage;
      if (newMessage.senderId && typeof newMessage.senderId === 'object') {
        transformedMessage = {
          ...newMessage,
          sender: {
            _id: newMessage.senderId._id,
            fullName: newMessage.senderId.fullName || 'Unknown User',
            profilePicture: newMessage.senderId.profilePicture,
            role: newMessage.senderId.role || 'client',
          },
          // Transform timestamp to createdAt for frontend compatibility
          createdAt: newMessage.timestamp || newMessage.createdAt,
        };
      }

      // Add message only if it's for the currently selected chat
      const currentSelectedChat = selectedChatRef.current;
      if (
        currentSelectedChat &&
        transformedMessage.chatId === currentSelectedChat._id
      ) {
        console.log(
          '📨 Adding message to current chat:',
          transformedMessage._id
        );
        setMessages((prev) => {
          // Check if message already exists (avoid duplicates from optimistic updates)
          const exists = prev.some((msg) => {
            // If it's the exact same message ID, it's a duplicate
            if (msg._id === transformedMessage._id) {
              return true;
            }

            // If we have a temporary message with the same content from the same sender within 10 seconds,
            // replace the temp message with the real one
            if (
              msg._id.startsWith('temp-') &&
              msg.content === transformedMessage.content &&
              msg.sender._id === transformedMessage.sender._id &&
              Math.abs(
                new Date(msg.createdAt).getTime() -
                  new Date(
                    transformedMessage.createdAt || transformedMessage.timestamp
                  ).getTime()
              ) < 10000 // 10 seconds
            ) {
              return true;
            }

            return false;
          });

          if (exists) {
            console.log(
              '📨 Replacing temp message with real message:',
              transformedMessage._id
            );
            // Replace the temporary message with the real one
            return prev.map((msg) => {
              if (
                msg._id.startsWith('temp-') &&
                msg.content === transformedMessage.content &&
                msg.sender._id === transformedMessage.sender._id
              ) {
                return transformedMessage;
              }
              return msg;
            });
          }

          console.log(
            '📨 Adding new message to state:',
            transformedMessage._id
          );
          return [...prev, transformedMessage];
        });
      } else {
        console.log('📨 Message not for current chat, skipping UI update');
      }
    },
    // onMessageRead callback
    (data: { chatId: string; messageId: string; readBy: string }) => {
      console.log('📖 Message read received:', data);
      // Update message read status if it's for current chat
      if (selectedChatRef.current?._id === data.chatId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg._id === data.messageId) {
              return {
                ...msg,
                readBy: [...(msg.readBy || []), data.readBy],
              };
            }
            return msg;
          })
        );
      }
    },
    // onChatUpdated callback
    (updatedChat: any) => {
      console.log('💬 Chat updated received:', updatedChat);

      // Update the chats list with the updated chat
      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat._id === updatedChat._id) {
            console.log('💬 Updating chat in list:', updatedChat._id);
            return {
              ...chat,
              lastMessage: updatedChat.lastMessage,
              lastMessageAt: updatedChat.lastMessageAt,
              lastMessageSenderId: updatedChat.lastMessageSenderId,
              unreadCount: updatedChat.unreadCount,
              updatedAt: updatedChat.updatedAt,
            };
          }
          return chat;
        });
      });
    }
  );

  // Debug: Track messages state changes
  useEffect(() => {
    console.log('📊 Messages state changed:', {
      count: messages.length,
      selectedChatId: selectedChat?._id,
      messages: messages.map((m) => ({
        _id: m._id,
        content: m.content.substring(0, 20) + '...',
        sender: m.sender?._id,
      })),
    });
  }, [messages, selectedChat?._id]);

  // Load messages for selected chat - UNUSED (inlined in handleChatSelect to prevent loops)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadMessages = useCallback(
    async (chatId: string) => {
      console.log(`🔍 LoadMessages: Starting for chat ${chatId}`);

      if (!session?.accessToken) {
        console.log('📝 LoadMessages: No access token');
        return;
      }

      try {
        console.log(`📝 LoadMessages: Making API call for chat ${chatId}`);
        setMessagesLoading(true);

        const response = await messageService.getChatMessages(
          chatId,
          1,
          50,
          session.accessToken
        );

        console.log(`📝 LoadMessages: API Response:`, response);

        if (response.success) {
          // Handle different response formats
          let messagesData: Message[] = [];

          if (Array.isArray(response.data)) {
            // Direct array format
            messagesData = response.data;
          } else if (
            response.data &&
            typeof response.data === 'object' &&
            'messages' in response.data
          ) {
            // Object format with messages property
            messagesData = response.data.messages || [];
          }

          console.log(
            `📝 LoadMessages: Extracted ${messagesData.length} messages`
          );

          // Validate and transform messages to match expected format
          const validMessages = messagesData
            .map((message: any) => {
              console.log('🔍 Processing message structure:', {
                _id: message._id,
                sender: message.sender,
                senderId: message.senderId,
                hasFullSender: message.sender && message.sender._id,
                hasSenderId: !!message.senderId,
              });

              // Handle different backend response formats
              if (message.senderId && !message.sender) {
                // Backend is sending senderId, need to transform to expected format
                // For now, create a minimal sender object
                return {
                  ...message,
                  sender: {
                    _id: message.senderId._id || message.senderId,
                    fullName: message.senderId.fullName || 'Unknown User',
                    profilePicture: message.senderId.profilePicture,
                    role: message.senderId.role || 'client',
                  },
                };
              } else if (message.sender && message.sender._id) {
                // Already in correct format
                return message;
              } else {
                // Invalid message
                console.warn(
                  '🚨 LoadMessages: Invalid message structure:',
                  message
                );
                return null;
              }
            })
            .filter((message: any) => message !== null);

          console.log(
            `📝 LoadMessages: ${validMessages.length} valid messages will be set`
          );
          console.log(
            `📝 LoadMessages: Setting messages state with:`,
            validMessages
          );

          setMessages(validMessages);
          markAsRead(chatId);
        } else {
          console.error('📝 LoadMessages: API error:', response.message);
          setError(response.message || 'Failed to load messages');
        }
      } catch (err: any) {
        console.error('📝 LoadMessages: Exception:', err);
        setError(err.message || 'Failed to load messages');
      } finally {
        console.log('📝 LoadMessages: Finished loading');
        setMessagesLoading(false);
      }
    },
    [session?.accessToken, markAsRead]
  );

  // Handle sending messages
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedChat || !session?.accessToken || !content.trim()) return;

      try {
        console.log('📤 Sending message:', {
          content,
          chatId: selectedChat._id,
          selectedChatRef: selectedChatRef.current?._id,
        });

        // Send via Socket.IO for real-time delivery
        socketSendMessage({
          chatId: selectedChat._id,
          messageType: 'text',
          content: content.trim(),
        });

        // Optimistic update - add temporary message
        const tempMessage: Message = {
          _id: `temp-${Date.now()}`,
          chatId: selectedChat._id,
          sender: {
            _id: session.user?.id || '',
            fullName: session.user?.name || '',
            profilePicture: session.user?.profilePicture,
            role: session.user?.role as 'client' | 'craftsman',
          },
          messageType: 'text',
          content: content.trim(),
          readBy: [session.user?.id || ''],
          status: 'sent' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        console.log('📝 Adding optimistic message:', tempMessage);
        setMessages((prev) => {
          console.log('📝 Current messages before adding:', prev.length);
          const newMessages = [...prev, tempMessage];
          console.log(
            '📝 Messages after adding optimistic:',
            newMessages.length
          );
          return newMessages;
        });
        setMessageInput(''); // Clear input

        // Stop typing indicator when message is sent
        if (isTyping) {
          setIsTyping(false);
          stopTyping(selectedChat._id);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
        }
      } catch (err: any) {
        console.error('Error sending message:', err);
        setError(err.message || 'Failed to send message');
      }
    },
    [
      selectedChat,
      session?.accessToken,
      session?.user,
      socketSendMessage,
      isTyping,
      stopTyping,
    ]
  );

  // Handle chat selection - simplified for auto-join backend
  const handleChatSelect = useCallback(
    async (chat: Chat) => {
      console.log('💬 Chat Selection: Selecting chat:', chat._id);

      // Validate chat data
      if (!chat || !chat._id || !chat.participants) {
        console.error('🚨 Chat Selection: Invalid chat data:', chat);
        return;
      }

      try {
        // Set new selected chat and clear messages
        setSelectedChat(chat);
        setMessages([]);

        // Load messages - backend auto-joins users to chats
        if (session?.accessToken) {
          console.log(`🔍 LoadMessages: Loading for chat ${chat._id}`);
          setMessagesLoading(true);

          try {
            const response = await messageService.getChatMessages(
              chat._id,
              1,
              50,
              session.accessToken
            );

            if (response.success && response.data) {
              console.log('📝 LoadMessages: API success, processing messages');
              console.log('📝 LoadMessages: Raw response data:', response.data);

              let messagesData: any[] = [];
              if (Array.isArray(response.data)) {
                messagesData = response.data;
              } else if (response.data.messages) {
                messagesData = response.data.messages;
              }

              console.log(
                '📝 LoadMessages: Extracted messages array:',
                messagesData
              );

              // Transform messages to handle backend format
              const validMessages = messagesData
                .map((message: any) => {
                  console.log('📝 Processing message:', {
                    _id: message._id,
                    senderId: message.senderId,
                    sender: message.sender,
                    content: message.content,
                  });

                  // Backend always sends senderId as populated object, transform to sender
                  if (
                    message.senderId &&
                    typeof message.senderId === 'object'
                  ) {
                    return {
                      ...message,
                      sender: {
                        _id: message.senderId._id,
                        fullName: message.senderId.fullName || 'Unknown User',
                        profilePicture: message.senderId.profilePicture,
                        role: message.senderId.role || 'client',
                      },
                      // Transform timestamp to createdAt for frontend compatibility
                      createdAt: message.timestamp || message.createdAt,
                    };
                  } else if (message.sender && message.sender._id) {
                    // Already in correct format, but ensure createdAt exists
                    return {
                      ...message,
                      createdAt: message.timestamp || message.createdAt,
                    };
                  } else {
                    console.warn('📝 Invalid message structure:', message);
                    return null;
                  }
                })
                .filter((message: any) => message !== null);

              console.log(
                `📝 LoadMessages: ${validMessages.length} messages loaded for chat ${chat._id}`
              );
              console.log('📝 LoadMessages: Valid messages:', validMessages);
              setMessages(validMessages);
              markAsRead(chat._id);
            } else {
              console.error('📝 LoadMessages: API error:', response.message);
            }
          } catch (err: any) {
            console.error('📝 LoadMessages: Exception:', err);
          } finally {
            setMessagesLoading(false);
          }
        }
      } catch (err: any) {
        console.error('Error in chat selection:', err);
        setMessagesLoading(false);
      }
    },
    [session?.accessToken, markAsRead]
  );

  // Handle typing indicators
  const handleTypingChange = useCallback(
    (inputValue: string) => {
      if (!selectedChat || !inputValue.trim()) {
        // Stop typing when input is empty
        if (isTyping) {
          setIsTyping(false);
          stopTyping(selectedChat?._id || '');
        }
        return;
      }

      // Start typing if not already typing
      if (!isTyping) {
        setIsTyping(true);
        startTyping(selectedChat._id);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        stopTyping(selectedChat._id);
      }, 3000);
    },
    [selectedChat, isTyping, startTyping, stopTyping]
  );

  // Handle image upload
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!selectedChat || !session?.accessToken) {
        console.error('Cannot upload image: missing chat or session');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      try {
        setImageUploading(true);
        setError(null);

        console.log('📤 Uploading image:', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          chatId: selectedChat._id,
        });

        // Upload image using the message service
        const result = await messageService.uploadImageMessage(
          selectedChat._id,
          file,
          session.accessToken
        );

        console.log('✅ Image upload successful:', result);

        // Show success message briefly
        const successMessage = 'Image uploaded successfully!';
        setError(null);

        // You could add a success state here if needed
        console.log('✅', successMessage);

        // The backend automatically sends the message via Socket.IO
        // so we don't need to manually add it to the state
      } catch (err: any) {
        console.error('❌ Image upload failed:', err);
        setError(err.message || 'Failed to upload image');
      } finally {
        setImageUploading(false);
      }
    },
    [selectedChat, session?.accessToken]
  );

  // Handle file selection
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleImageUpload]
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith('image/'));

      if (imageFile) {
        handleImageUpload(imageFile);
      } else if (files.length > 0) {
        setError('Please drop an image file');
      }
    },
    [handleImageUpload]
  );

  // Auto-scroll to bottom functionality
  const scrollToBottom = useCallback((smooth: boolean = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
    });
  }, []);

  // Check if user is near bottom of messages
  const isNearBottom = useCallback(() => {
    const container = messagesContainerRef.current?.parentElement;
    if (!container) return true;

    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < 100; // Within 100px of bottom
  }, []);

  // Auto-scroll when messages change (only if user is near bottom or just sent a message)
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const isOwnMessage = lastMessage?.sender._id === session?.user?.id;

      // Always scroll for own messages, or when near bottom for others
      if (isOwnMessage || isNearBottom()) {
        setTimeout(() => scrollToBottom(), 100); // Small delay to ensure DOM is updated
      }
    }
  }, [messages, scrollToBottom, isNearBottom, session?.user?.id]);

  // Scroll to bottom when chat changes
  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      setTimeout(() => scrollToBottom(false), 100); // Instant scroll when switching chats
    }
  }, [selectedChat, messages.length, scrollToBottom]);

  // Initial scroll to bottom when messages first load
  useEffect(() => {
    if (messages.length > 0 && !messagesLoading) {
      setTimeout(() => scrollToBottom(false), 200); // Instant scroll on initial load
    }
  }, [messages.length, messagesLoading, scrollToBottom]);

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Initial load of chats
  useEffect(() => {
    let mounted = true;

    const initializeChats = async () => {
      if (!session?.accessToken) return;

      try {
        console.log('Initializing chats...');
        setLoading(true);
        setError(null);

        const response = await messageService.getChats(
          1,
          50,
          session.accessToken
        );

        if (!mounted) return;

        if (response.success) {
          let chatsData: Chat[] = [];

          if (Array.isArray(response.data)) {
            chatsData = response.data;
          } else if (response.data && 'chats' in response.data) {
            chatsData = response.data.chats || [];
          }

          console.log('Loaded', chatsData.length, 'chats');
          setChats(chatsData);

          // Auto-select first chat if available
          if (chatsData.length > 0 && !selectedChat) {
            let chatToSelect = chatsData[0];

            // If initialChatId is provided, try to find that specific chat
            if (initialChatId) {
              const foundChat = chatsData.find(
                (chat) => chat._id === initialChatId
              );
              if (foundChat) {
                chatToSelect = foundChat;
                console.log('🎯 Auto-selecting chat from URL:', initialChatId);
              }
            }

            console.log(
              `🤖 Auto-selection: Will select chat ${chatToSelect._id}`
            );
            // Call handleChatSelect directly without dependency issues
            setTimeout(() => handleChatSelect(chatToSelect), 0);
          }
        } else {
          setError(response.message || 'Failed to load chats');
        }
      } catch (err: any) {
        if (mounted) {
          console.error('Error loading chats:', err);
          setError(err.message || 'Failed to load chats');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (session?.accessToken && chats.length === 0) {
      initializeChats();
    }

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    session?.accessToken,
    chats.length,
    selectedChat,
    initialChatId,
    // handleChatSelect intentionally excluded to prevent dependency loop
  ]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <h3 className="text-lg font-semibold">Loading chats...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full max-h-full overflow-hidden">
      <div className="h-full flex bg-background border border-border rounded-lg overflow-hidden">
        {/* Sidebar - Chat List */}
        <div
          className={`
            w-full sm:w-80 
            ${selectedChat ? 'hidden sm:flex' : 'flex'} 
            border-r border-border bg-muted/30 flex-col
          `}
        >
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-border bg-background">
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              Messages
            </h1>
            <p className="text-sm text-muted-foreground">Your conversations</p>
            {/* Connection status */}
            <div className="flex items-center gap-2 mt-2 text-xs">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></div>
              <span className="text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chats.map((chat) => {
              const otherParticipant = chat.participants.find(
                (p) => p._id !== session?.user?.id
              );
              const isSelected = selectedChat?._id === chat._id;

              return (
                <div
                  key={chat._id}
                  onClick={() => handleChatSelect(chat)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                    isSelected
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-accent/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Profile Picture */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0">
                      {otherParticipant?.profilePicture ? (
                        <Image
                          src={otherParticipant.profilePicture}
                          alt={otherParticipant.fullName}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm sm:text-base font-semibold text-primary">
                            {otherParticipant?.fullName
                              ?.charAt(0)
                              .toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {otherParticipant?.fullName || 'Unknown User'}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage || 'No messages'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content - Chat Window */}
        <div
          className={`
            flex-1 flex flex-col 
            ${selectedChat ? 'flex' : 'hidden sm:flex'}
          `}
        >
          {selectedChat ? (
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-background">
                {/* Back button for mobile */}
                <button
                  onClick={() => setSelectedChat(null)}
                  className="sm:hidden p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="flex items-center gap-3 flex-1">
                  {/* Profile Picture */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0">
                    {(() => {
                      const otherUser = selectedChat.participants.find(
                        (p) => p._id !== session?.user?.id
                      );
                      return otherUser?.profilePicture ? (
                        <Image
                          src={otherUser.profilePicture}
                          alt={otherUser.fullName}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs sm:text-sm font-semibold text-primary">
                            {otherUser?.fullName?.charAt(0).toUpperCase() ||
                              '?'}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => {
                        const otherUser = selectedChat.participants.find(
                          (p) => p._id !== session?.user?.id
                        );
                        if (otherUser) {
                          window.location.href = `/user/${otherUser._id}`;
                        }
                      }}
                      className="font-medium sm:font-semibold text-sm sm:text-base text-foreground hover:text-primary transition-colors cursor-pointer block truncate text-left"
                    >
                      {selectedChat.participants.find(
                        (p) => p._id !== session?.user?.id
                      )?.fullName || 'Unknown User'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div
                className={`flex-1 overflow-y-auto p-4 relative ${
                  isDragging
                    ? 'bg-primary/5 border-2 border-primary border-dashed'
                    : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isDragging && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/10 z-10">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-primary">
                        Drop image here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Release to upload image
                      </p>
                    </div>
                  </div>
                )}
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">
                        Loading messages...
                      </p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No messages yet
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Start the conversation
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3" ref={messagesContainerRef}>
                    {messages.map((message, index) => {
                      const isOwn = message.sender._id === session?.user?.id;
                      const showAvatar =
                        !isOwn &&
                        (index === 0 ||
                          messages[index - 1]?.sender._id !==
                            message.sender._id ||
                          new Date(message.createdAt).getTime() -
                            new Date(messages[index - 1]?.createdAt).getTime() >
                            300000); // 5 minutes

                      return (
                        <div
                          key={message._id}
                          className={`flex items-end gap-2 ${
                            isOwn
                              ? 'justify-end flex-row-reverse'
                              : 'justify-start'
                          }`}
                        >
                          {/* Profile Picture - only for other users */}
                          {!isOwn && (
                            <div
                              className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ${
                                showAvatar ? 'opacity-100' : 'opacity-0'
                              }`}
                            >
                              {showAvatar && (
                                <>
                                  {message.sender.profilePicture ? (
                                    <Image
                                      src={message.sender.profilePicture}
                                      alt={message.sender.fullName}
                                      width={32}
                                      height={32}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                      <span className="text-xs font-medium text-primary">
                                        {message.sender.fullName
                                          .charAt(0)
                                          .toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}

                          {/* Message Content */}
                          <div
                            className={`flex flex-col ${
                              isOwn ? 'items-end' : 'items-start'
                            }`}
                          >
                            {/* Sender name - only for other users and when showing avatar */}
                            {!isOwn && showAvatar && (
                              <span className="text-xs text-muted-foreground mb-1 ml-1">
                                {message.sender.fullName}
                              </span>
                            )}

                            <div
                              className={`max-w-[280px] sm:max-w-[320px] md:max-w-[400px] lg:max-w-[70%] rounded-2xl px-3 py-2 ${
                                isOwn
                                  ? 'bg-primary text-primary-foreground rounded-br-md'
                                  : 'bg-muted text-foreground rounded-bl-md'
                              } ${!isOwn && !showAvatar ? 'ml-10' : ''}`}
                            >
                              {message.messageType === 'image' ? (
                                <div className="space-y-2">
                                  <div className="relative w-full max-w-xs">
                                    <Image
                                      src={message.content}
                                      alt="Shared image"
                                      width={280}
                                      height={200}
                                      className="w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
                                      onClick={() => {
                                        setSelectedImage(message.content);
                                      }}
                                      onError={() => {
                                        console.error(
                                          'Failed to load image:',
                                          message.content
                                        );
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs opacity-70 block">
                                    {new Date(
                                      message.createdAt
                                    ).toLocaleTimeString()}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm whitespace-pre-wrap break-words">
                                    {message.content}
                                  </p>
                                  <span className="text-xs opacity-70 mt-1 block">
                                    {new Date(
                                      message.createdAt
                                    ).toLocaleTimeString()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-border bg-background p-2 sm:p-4">
                {/* Error Display */}
                {error && (
                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                    {error}
                    <button
                      onClick={() => setError(null)}
                      className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Typing Indicator */}
                {(typingUsers.length > 0 || imageUploading) && selectedChat && (
                  <div className="mb-2 text-sm text-muted-foreground flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></div>
                    </div>
                    <span>
                      {imageUploading
                        ? 'Uploading image...'
                        : typingUsers.filter(
                            (u) =>
                              u.chatId === selectedChat._id &&
                              u.userId !== session?.user?.id
                          ).length > 0
                        ? 'Someone is typing...'
                        : null}
                    </span>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  {/* Image Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    className="p-2 h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    title="Upload image"
                  >
                    {imageUploading ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <div className="flex-1 relative min-w-0">
                    <textarea
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        handleTypingChange(e.target.value);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(messageInput);
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg sm:rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                      rows={1}
                      style={{ minHeight: '36px' }}
                    />
                  </div>
                  <button
                    onClick={() => handleSendMessage(messageInput)}
                    disabled={!messageInput.trim()}
                    className="p-2 h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Select a conversation
                </h3>
                <p className="text-sm text-muted-foreground">
                  {chats.length === 0
                    ? 'Start your first conversation'
                    : 'Choose a chat to start messaging'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={!!selectedImage}
        images={selectedImage || ''}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default MessagingLayout;
