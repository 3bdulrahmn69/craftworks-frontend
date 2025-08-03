'use client';

import React from 'react';

interface EmptyStateProps {
  hasChats: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasChats }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
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
          {hasChats ? 'Select a conversation' : 'No conversations yet'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasChats
            ? 'Choose a chat to start messaging'
            : 'Start your first conversation'}
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
