'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';

interface TypingIndicatorProps {
  isVisible: boolean;
  userNames?: string[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isVisible,
  userNames = [],
}) => {
  const locale = useLocale();
  const t = useTranslations('messaging');
  const isRTL = locale === 'ar';

  if (!isVisible) return null;

  const getDisplayText = () => {
    if (userNames.length === 0) {
      return t('chat.typing');
    }

    if (userNames.length === 1) {
      return t('chat.userTyping', { name: userNames[0] });
    }

    return t('chat.usersTyping', { names: userNames.join(', ') });
  };

  return (
    <div
      className={`flex items-center gap-2 p-2 text-sm text-muted-foreground ${
        isRTL ? 'flex-row-reverse' : ''
      }`}
    >
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
      <span>{getDisplayText()}</span>
    </div>
  );
};

export default TypingIndicator;
