'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { Message } from '@/app/types/messages';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import Image from 'next/image';
import { HiCheck, HiCheckBadge } from 'react-icons/hi2';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onImageClick?: (imageUrl: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  onImageClick,
}) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const dateLocale = locale === 'ar' ? ar : enUS;

  // Safety check for message structure
  if (!message || !message._id || !message.sender || !message.sender._id) {
    console.error('🚨 MessageBubble: Invalid message structure:', message);
    return null;
  }

  const formatMessageTime = (date: string) => {
    try {
      const messageDate = new Date(date);
      const now = new Date();
      const diffInHours =
        (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        // Show time for messages less than 24 hours old
        return messageDate.toLocaleTimeString(
          locale === 'ar' ? 'ar-EG' : 'en-US',
          {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }
        );
      } else {
        // Show relative time for older messages
        return formatDistanceToNow(messageDate, {
          addSuffix: true,
          locale: dateLocale,
        });
      }
    } catch {
      return '';
    }
  };

  const getMessageStatus = () => {
    switch (message.status) {
      case 'sent':
        return <HiCheck className="w-3 h-3 text-muted-foreground" />;
      case 'delivered':
        return <HiCheckBadge className="w-3 h-3 text-muted-foreground" />;
      case 'read':
        return <HiCheckBadge className="w-3 h-3 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'} ${
        isRTL && !isOwn ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar for other's messages */}
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0">
          {message.sender.profilePicture ? (
            <Image
              src={message.sender.profilePicture}
              alt={message.sender.fullName}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground">
                {message.sender.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`max-w-[70%] ${
          isOwn ? 'items-end' : 'items-start'
        } flex flex-col`}
      >
        {/* Sender name for group chats or non-own messages */}
        {!isOwn && (
          <span className="text-xs text-muted-foreground mb-1 px-2">
            {message.sender.fullName}
          </span>
        )}

        {/* Message content */}
        <div
          className={`
            relative px-3 py-2 rounded-2xl max-w-full break-words
            ${
              isOwn
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted text-foreground rounded-bl-md'
            }
          `}
        >
          {message.messageType === 'image' ? (
            <div className="relative">
              <Image
                src={message.content}
                alt="Shared image"
                width={200}
                height={200}
                className="rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onImageClick?.(message.content)}
              />
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Message info */}
        <div
          className={`flex items-center gap-1 mt-1 px-2 ${
            isOwn ? 'flex-row-reverse' : ''
          }`}
        >
          <span className="text-xs text-muted-foreground">
            {formatMessageTime(message.createdAt)}
          </span>

          {/* Message status for own messages */}
          {isOwn && getMessageStatus()}
        </div>
      </div>

      {/* Spacer for own messages to maintain alignment */}
      {isOwn && !showAvatar && <div className="w-8" />}
    </div>
  );
};

export default MessageBubble;
