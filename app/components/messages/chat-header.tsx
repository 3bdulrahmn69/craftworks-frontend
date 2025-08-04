'use client';

import React from 'react';
import Image from 'next/image';
import { Chat } from '@/app/types/messages';
import { useRouter } from 'next/navigation';

interface ChatHeaderProps {
  selectedChat: Chat;
  currentUserId: string | undefined;
  onBackClick: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedChat,
  currentUserId,
  onBackClick,
}) => {
  const router = useRouter();

  const otherParticipant = selectedChat.participants.find(
    (p) => p._id !== currentUserId
  );

  const handleUserDetailsClick = () => {
    if (otherParticipant) {
      router.push(`/user-details/${otherParticipant._id}`);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-background">
      {/* Back button for mobile */}
      <button
        onClick={onBackClick}
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
          {otherParticipant?.profilePicture ? (
            <Image
              src={otherParticipant.profilePicture}
              alt={otherParticipant.fullName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              style={{ width: 'auto', height: 'auto' }}
            />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {otherParticipant?.fullName?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleUserDetailsClick}
          className="flex-1 text-left hover:opacity-80 transition-opacity"
        >
          <h2 className="text-lg font-semibold text-foreground">
            {otherParticipant?.fullName || 'Unknown User'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {otherParticipant?.role === 'craftsman' ? 'Craftsman' : 'Client'}
          </p>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
