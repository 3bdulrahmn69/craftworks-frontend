'use client';

import React from 'react';
import { Message } from '@/app/types/messages';
import MessageBubble from './message-bubble';

interface MessageContainerProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  onImageClick: (imageUrl: string) => void;
}

const MessageContainer: React.FC<MessageContainerProps> = ({
  message,
  isOwn,
  showAvatar,
  onImageClick,
}) => {
  // Safety check for message structure
  if (!message || !message._id || !message.sender || !message.sender._id) {
    console.error('🚨 MessageContainer: Invalid message structure:', message);
    return null;
  }

  return (
    <div
      className={`flex items-end gap-2 ${
        isOwn ? 'justify-end' : 'justify-start'
      }`}
    >
      <MessageBubble
        message={message}
        isOwn={isOwn}
        showAvatar={showAvatar}
        onImageClick={onImageClick}
      />
    </div>
  );
};

export default MessageContainer;
