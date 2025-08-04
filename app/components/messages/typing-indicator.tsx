'use client';

import React from 'react';

interface TypingIndicatorProps {
  isVisible: boolean;
  userNames?: string[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isVisible,
  userNames = [],
}) => {
  if (!isVisible) return null;

  const displayText =
    userNames.length > 0
      ? `${userNames.join(', ')} ${
          userNames.length === 1 ? 'is' : 'are'
        } typing...`
      : 'Someone is typing...';

  return (
    <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <span>{displayText}</span>
    </div>
  );
};

export default TypingIndicator;
