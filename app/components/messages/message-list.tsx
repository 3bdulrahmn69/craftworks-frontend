'use client';

import React from 'react';
import { Message } from '@/app/types/messages';
import MessageBubble from './message-bubble';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('messaging');

  if (messagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            {t('loading.messages')}
          </p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-6">
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
            {t('message.noMessages')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('message.startConversation')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1 p-4" ref={messagesContainerRef}>
        {messages
          .filter(
            (message) =>
              message && message._id && message.sender && message.sender._id
          )
          .map((message, filteredIndex, filteredMessages) => {
            const isOwn = message.sender._id === currentUserId;

            const prevMessage =
              filteredIndex > 0 ? filteredMessages[filteredIndex - 1] : null;
            const timeDiff = prevMessage
              ? new Date(message.createdAt).getTime() -
                new Date(prevMessage.createdAt).getTime()
              : 0;

            // Show avatar logic
            const showAvatar =
              !isOwn &&
              (filteredIndex === 0 ||
                !prevMessage?.sender?._id ||
                prevMessage.sender._id !== message.sender._id ||
                timeDiff > 60000); // 1 minute

            // Add extra spacing for different senders or time gaps
            const needsExtraSpacing =
              filteredIndex > 0 &&
              (prevMessage?.sender._id !== message.sender._id ||
                timeDiff > 300000); // 5 minutes

            return (
              <div
                key={message._id}
                className={needsExtraSpacing ? 'mt-4' : ''}
              >
                <MessageBubble
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  onImageClick={onImageClick}
                />
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
