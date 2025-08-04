'use client';

import React from 'react';
import Image from 'next/image';
import { Chat } from '@/app/types/messages';
import ConnectionStatus from './connection-status';

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
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border bg-background">
        <h1 className="text-lg sm:text-xl font-bold text-foreground">
          Messages
        </h1>
        <p className="text-sm text-muted-foreground">Your conversations</p>
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
                        {otherParticipant?.fullName?.charAt(0).toUpperCase() ||
                          '?'}
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
  );
};

export default ChatSidebar;
