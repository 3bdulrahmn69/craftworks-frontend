'use client';

import React from 'react';
import Image from 'next/image';
import { Message } from '@/app/types/messages';

interface MessageListProps {
  messages: Message[];
  currentUserId: string | undefined;
  messagesLoading: boolean;
  onImageClick: (imageUrl: string) => void;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  messagesLoading,
  onImageClick,
  messagesContainerRef,
  messagesEndRef,
}) => {
  // Safe date formatting function
  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Just now';
      }
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      console.warn('Invalid date format:', dateString);
      return 'Just now';
    }
  };

  if (messagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-3 p-4" ref={messagesContainerRef}>
        {messages
          .filter(
            (message) =>
              message && message._id && message.sender && message.sender._id
          )
          .map((message, filteredIndex, filteredMessages) => {
            const isOwn = message.sender._id === currentUserId;

            // Use filtered array for avatar logic
            const showAvatar =
              !isOwn &&
              (filteredIndex === 0 ||
                !filteredMessages[filteredIndex - 1]?.sender?._id ||
                filteredMessages[filteredIndex - 1]?.sender._id !==
                  message.sender._id ||
                new Date(message.createdAt).getTime() -
                  new Date(
                    filteredMessages[filteredIndex - 1]?.createdAt || 0
                  ).getTime() >
                  300000); // 5 minutes

            return (
              <div
                key={message._id}
                className={`flex items-end gap-2 ${
                  isOwn ? 'justify-end' : 'justify-start'
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
                              {message.sender.fullName.charAt(0).toUpperCase()}
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
                  } max-w-[70%] sm:max-w-[60%]`}
                >
                  {/* Sender name - only for other users and when showing avatar */}
                  {!isOwn && showAvatar && (
                    <span className="text-xs text-muted-foreground mb-1 px-1">
                      {message.sender.fullName}
                    </span>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    } ${!isOwn && !showAvatar ? 'ml-10' : ''}`}
                  >
                    {message.messageType === 'image' ? (
                      <div className="space-y-2">
                        <div className="relative max-w-xs">
                          <Image
                            src={message.content}
                            alt="Shared image"
                            width={300}
                            height={200}
                            className="w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
                            onClick={() => onImageClick(message.content)}
                            onError={() => {
                              console.error(
                                'Failed to load image:',
                                message.content
                              );
                            }}
                          />
                        </div>
                        <span className="text-xs opacity-70 block">
                          {formatMessageTime(message.createdAt)}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {formatMessageTime(message.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
