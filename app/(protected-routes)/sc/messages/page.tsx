'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MessagingLayout from '@/app/components/messages/messaging-layout';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import Redirect from '@/app/components/redirect';
import BackButton from '@/app/components/ui/back-button';

function ClientMessagesContent() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId') || undefined;

  return (
    <div className="h-screen w-full bg-background">
      {/* Back Button Header */}
      <div className="bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <BackButton showLabel />
        <div className="h-4 w-px bg-border" />
        <h1 className="text-lg font-semibold text-foreground">Messages</h1>
      </div>

      {/* Messages Layout */}
      <div className="h-[calc(100vh-60px)]">
        <MessagingLayout initialChatId={chatId} />
      </div>
    </div>
  );
}

const ClientMessagesPage = () => {
  return (
    <Redirect requireAuth={true} allowedRoles={['client']}>
      <Suspense
        fallback={
          <div className="h-screen w-full bg-background flex items-center justify-center">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Loading Messages...</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we load your conversations
                </p>
              </div>
            </div>
          </div>
        }
      >
        <ClientMessagesContent />
      </Suspense>
    </Redirect>
  );
};

export default ClientMessagesPage;
