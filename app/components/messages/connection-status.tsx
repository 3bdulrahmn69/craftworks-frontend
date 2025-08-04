'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface ConnectionStatusProps {
  isConnected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  const t = useTranslations('messaging');

  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-muted-foreground">
        {isConnected ? t('connection.connected') : t('connection.disconnected')}
      </span>
    </div>
  );
};

export default ConnectionStatus;
