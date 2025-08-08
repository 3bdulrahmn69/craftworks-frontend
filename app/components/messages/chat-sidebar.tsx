'use client';

import React from 'react';
import Image from 'next/image';
import { Chat } from '@/app/types/messages';
import ConnectionStatus from './connection-status';
import BackButton from '../ui/back-button';
import { useTranslations } from 'next-intl';

interface ChatSidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  currentUserId: string | undefined;
  isConnected: boolean;
  onChatSelect: (chat: Chat) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  selectedChat,
  currentUserId,
  isConnected,
  onChatSelect,
}) => {
  const t = useTranslations('messaging');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border bg-background">
        <div className="flex items-center gap-1">
          <BackButton />
          <h1 className="text-lg sm:text-xl font-bold text-foreground">
            {t('title')}
          </h1>
        </div>

        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>

        {/* Connection status */}
        <div className="mt-2">
          <ConnectionStatus isConnected={isConnected} />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chats.map((chat) => {
          const otherParticipant = chat.participants.find(
            (p) => p._id !== currentUserId
          );
          const isSelected = selectedChat?._id === chat._id;

          // Calculate unread count for current user
          const unreadCount = chat.unreadCount?.[currentUserId || ''] || 0;

          // Check if last message was sent by current user
          const isLastMessageFromMe =
            chat.lastMessageSenderId === currentUserId;

          // Format last message with "You:" prefix if needed
          const formattedLastMessage = chat.lastMessage
            ? isLastMessageFromMe
              ? `${t('chat.you')}: ${chat.lastMessage}`
              : chat.lastMessage
            : t('chat.noMessages');

          return (
            <div
              key={chat._id}
              onClick={() => onChatSelect(chat)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                isSelected
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-accent/30'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Profile Picture */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 relative">
                  {otherParticipant?.profilePicture ? (
                    <Image
                      src={otherParticipant.profilePicture}
                      alt={otherParticipant.fullName}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm sm:text-base font-semibold text-primary">
                        {otherParticipant?.fullName?.charAt(0).toUpperCase() ||
                          '?'}
                      </span>
                    </div>
                  )}

                  {/* Unread count badge */}
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {otherParticipant?.fullName || 'Unknown User'}
                    </h4>
                    {unreadCount > 0 && (
                      <span className="text-xs text-destructive font-medium ml-2">
                        {t('chat.unreadCount', { count: unreadCount })}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm truncate ${
                      unreadCount > 0
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {formattedLastMessage}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatSidebar;
