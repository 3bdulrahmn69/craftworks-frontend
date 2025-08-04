'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Chat, Message } from '@/app/types/messages';
import { messageService } from '@/app/services/messages';
import { useSocket } from '@/app/hooks/useSocket-simple';
import ChatSidebar from './chat-sidebar';
import ChatHeader from './chat-header';
import MessageList from './message-list';
import MessageInput from './message-input';
import EmptyState from './empty-state';
import TypingIndicator from './typing-indicator';
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
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const selectedChatRef = useRef<Chat | null>(null);

  // Update ref when selectedChat changes
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Socket.IO integration
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

      // Validate the incoming message
      if (!newMessage || !newMessage._id) {
        console.warn('Invalid message received:', newMessage);
        return;
      }

      // Transform the message format
      let transformedMessage: Message;
      if (newMessage.senderId && typeof newMessage.senderId === 'object') {
        transformedMessage = {
          _id: newMessage._id,
          chatId: newMessage.chatId,
          content: newMessage.content,
          messageType: newMessage.messageType || 'text',
          readBy: newMessage.readBy || [],
          status: (newMessage.status || 'sent') as
            | 'sent'
            | 'delivered'
            | 'read',
          createdAt:
            newMessage.timestamp ||
            newMessage.createdAt ||
            new Date().toISOString(),
          updatedAt: newMessage.updatedAt || new Date().toISOString(),
          sender: {
            _id: newMessage.senderId._id || 'unknown',
            fullName: newMessage.senderId.fullName || 'Unknown User',
            profilePicture: newMessage.senderId.profilePicture,
            role:
              (newMessage.senderId.role as 'client' | 'craftsman') || 'client',
          },
        };
      } else if (
        newMessage.sender &&
        typeof newMessage.sender === 'object' &&
        newMessage.sender._id
      ) {
        transformedMessage = {
          _id: newMessage._id,
          chatId: newMessage.chatId,
          content: newMessage.content,
          messageType: newMessage.messageType || 'text',
          readBy: newMessage.readBy || [],
          status: (newMessage.status || 'sent') as
            | 'sent'
            | 'delivered'
            | 'read',
          createdAt: newMessage.createdAt || new Date().toISOString(),
          updatedAt: newMessage.updatedAt || new Date().toISOString(),
          sender: newMessage.sender,
        };
      } else {
        // Fallback for messages without proper sender structure
        console.warn(
          'Message missing proper sender structure, using fallback:',
          newMessage
        );
        transformedMessage = {
          _id: newMessage._id,
          chatId: newMessage.chatId,
          content: newMessage.content,
          messageType: newMessage.messageType || 'text',
          readBy: newMessage.readBy || [],
          status: (newMessage.status || 'sent') as
            | 'sent'
            | 'delivered'
            | 'read',
          createdAt:
            newMessage.timestamp ||
            newMessage.createdAt ||
            new Date().toISOString(),
          updatedAt: newMessage.updatedAt || new Date().toISOString(),
          sender: {
            _id: newMessage.senderId || 'unknown',
            fullName: 'Unknown User',
            role: 'client' as const,
          },
        };
      }

      // Add message only if it's for the currently selected chat
      const currentSelectedChat = selectedChatRef.current;
      if (
        currentSelectedChat &&
        transformedMessage.chatId === currentSelectedChat._id
      ) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === transformedMessage._id);
          if (exists) return prev;
          return [...prev, transformedMessage];
        });
      }
    },
    // onMessageRead callback
    (data: { chatId: string; messageId: string; readBy: string }) => {
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
      setChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat._id === updatedChat._id) {
            return {
              ...chat,
              lastMessage: updatedChat.lastMessage,
              lastMessageAt: updatedChat.lastMessageAt,
              unreadCount: updatedChat.unreadCount,
            };
          }
          return chat;
        });
      });
    }
  );

  // Load messages for selected chat
  const loadMessages = async (chatId: string) => {
    if (!session?.accessToken) return;

    try {
      setMessagesLoading(true);
      const response = await messageService.getChatMessages(
        chatId,
        1,
        50,
        session.accessToken
      );

      if (response.success) {
        const messagesData = Array.isArray(response.data)
          ? response.data
          : response.data?.messages || [];

        // Transform and validate messages to ensure proper structure
        const validatedMessages = messagesData
          .filter((msg: any) => {
            if (!msg || !msg._id) {
              console.warn('Filtering out invalid message (no _id):', msg);
              return false;
            }
            return true;
          })
          .map((msg: any) => {
            // Transform the API response format to match our Message interface
            const transformedMessage: Message = {
              _id: msg._id,
              chatId: msg.chatId,
              content: msg.content,
              messageType: msg.messageType || 'text',
              readBy: msg.isRead ? [msg.senderId?._id || msg.senderId] : [],
              status: (msg.isRead ? 'read' : 'sent') as
                | 'sent'
                | 'delivered'
                | 'read',
              createdAt:
                msg.timestamp || msg.createdAt || new Date().toISOString(),
              updatedAt:
                msg.timestamp || msg.updatedAt || new Date().toISOString(),
              sender: {
                _id: '',
                fullName: 'Unknown User',
                role: 'client' as const,
              },
            };

            // Handle sender - it could be an object or just an ID
            if (msg.senderId && typeof msg.senderId === 'object') {
              transformedMessage.sender = {
                _id: msg.senderId._id || 'unknown',
                fullName: msg.senderId.fullName || 'Unknown User',
                profilePicture: msg.senderId.profilePicture,
                role: (msg.senderId.role as 'client' | 'craftsman') || 'client',
              };
            } else if (msg.sender && typeof msg.sender === 'object') {
              transformedMessage.sender = {
                _id: msg.sender._id || 'unknown',
                fullName: msg.sender.fullName || 'Unknown User',
                profilePicture: msg.sender.profilePicture,
                role: (msg.sender.role as 'client' | 'craftsman') || 'client',
              };
            } else {
              // Fallback for missing sender
              console.warn(
                'Message missing proper sender, using fallback:',
                msg._id
              );
              transformedMessage.sender = {
                _id: msg.senderId || 'unknown',
                fullName: 'Unknown User',
                role: 'client' as const,
              };
            }

            return transformedMessage;
          });

        console.log(
          `✅ Loaded ${validatedMessages.length} validated messages for chat ${chatId}`
        );
        setMessages(validatedMessages);
      } else {
        setError(response.message || 'Failed to load messages');
      }
    } catch (err: any) {
      console.error('Error loading messages:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  // Handle chat selection
  const handleChatSelect = async (chat: Chat) => {
    console.log('🎯 Chat selected:', chat._id);
    setSelectedChat(chat);
    setShowMobileChat(true);
    setMessages([]);
    await loadMessages(chat._id);

    // Mark chat as read
    if (markAsRead) {
      markAsRead(chat._id);
    }
  };

  // Handle sending messages
  const handleSendMessage = (content: string) => {
    if (!content.trim() || !selectedChat || !socketSendMessage) return;

    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      content: content.trim(),
      messageType: 'text',
      sender: {
        _id: session?.user?.id || '',
        fullName: session?.user?.name || 'You',
        profilePicture: session?.user?.image || undefined,
        role: (session?.user?.role as 'client' | 'craftsman') || 'client',
      },
      chatId: selectedChat._id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readBy: [],
      status: 'sent',
    };

    // Add optimistic message
    setMessages((prev) => [...prev, tempMessage]);

    // Send via socket
    socketSendMessage({
      chatId: selectedChat._id,
      content: content.trim(),
      messageType: 'text',
    });
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle image modal
  const handleImageClick = (imageUrl: string) => {
    // For now, just show single image since Message type doesn't have fileUrl
    setSelectedImages([imageUrl]);
    setSelectedImageIndex(0);
    setImageModalOpen(true);
  };

  // Handle mobile back
  const handleBackToChats = () => {
    setShowMobileChat(false);
    setSelectedChat(null);
  };

  // Load initial chats
  useEffect(() => {
    const initializeChats = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        const response = await messageService.getChats(
          1,
          50,
          session.accessToken
        );

        if (response.success) {
          const chatsData = Array.isArray(response.data)
            ? response.data
            : response.data?.chats || [];

          setChats(chatsData);

          // Auto-select initial chat
          if (chatsData.length > 0 && initialChatId) {
            const foundChat = chatsData.find(
              (chat) => chat._id === initialChatId
            );
            if (foundChat) {
              handleChatSelect(foundChat);
            }
          }
        } else {
          setError(response.message || 'Failed to load chats');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load chats');
      } finally {
        setLoading(false);
      }
    };

    if (session?.accessToken && chats.length === 0) {
      initializeChats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, initialChatId]);

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Loading Conversations
          </h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we load your messages...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-destructive mb-2">Error</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-background border border-border rounded-lg overflow-hidden">
      {/* Chat Sidebar */}
      <div
        className={`${
          selectedChat && showMobileChat ? 'hidden' : 'block'
        } w-full sm:w-80 sm:block border-r border-border`}
      >
        <ChatSidebar
          chats={chats}
          selectedChat={selectedChat}
          onChatSelect={handleChatSelect}
          isConnected={isConnected}
          currentUserId={session?.user?.id}
        />
      </div>

      {/* Chat Window */}
      <div
        className={`${
          selectedChat && showMobileChat ? 'flex' : 'hidden sm:flex'
        } flex-1 flex-col min-w-0`}
      >
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <ChatHeader
              selectedChat={selectedChat}
              currentUserId={session?.user?.id}
              onBackClick={handleBackToChats}
            />

            {/* Messages */}
            <div className="flex-1 flex flex-col min-h-0">
              <MessageList
                messages={messages}
                currentUserId={session?.user?.id}
                onImageClick={handleImageClick}
                messagesLoading={messagesLoading}
                messagesContainerRef={
                  messagesContainerRef as React.RefObject<HTMLDivElement>
                }
                messagesEndRef={
                  messagesEndRef as React.RefObject<HTMLDivElement>
                }
              />

              {/* Typing Indicator */}
              <TypingIndicator
                isVisible={
                  selectedChat
                    ? typingUsers.some(
                        (user) =>
                          user.chatId === selectedChat._id &&
                          user.userId !== session?.user?.id
                      )
                    : false
                }
                userNames={typingUsers
                  .filter(
                    (user) =>
                      selectedChat &&
                      user.chatId === selectedChat._id &&
                      user.userId !== session?.user?.id
                  )
                  .map((user) => user.userName || 'Someone')}
              />

              {/* Message Input */}
              <MessageInput
                selectedChatId={selectedChat._id}
                onSendMessage={(
                  content: string,
                  messageType: 'text' | 'image'
                ) => {
                  if (messageType === 'text') {
                    handleSendMessage(content);
                  }
                  // Image messages are handled directly in MessageInput
                }}
                onTypingStart={() => {
                  if (selectedChat && startTyping) {
                    startTyping(selectedChat._id);
                  }
                }}
                onTypingStop={() => {
                  if (selectedChat && stopTyping) {
                    stopTyping(selectedChat._id);
                  }
                }}
                disabled={!selectedChat}
              />
            </div>
          </>
        ) : (
          <EmptyState hasChats={chats.length > 0} />
        )}
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        images={selectedImages}
        initialIndex={selectedImageIndex}
        onClose={() => setImageModalOpen(false)}
      />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            console.log('File selected:', file.name);
            // Handle file upload here
          }
        }}
      />
    </div>
  );
};

export default MessagingLayout;
