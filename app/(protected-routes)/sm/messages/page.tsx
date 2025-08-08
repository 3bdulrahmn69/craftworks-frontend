'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MessagingLayout from '@/app/components/messages/messaging-layout';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import Redirect from '@/app/components/redirect';

function CraftsmanMessagesContent() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId') || undefined;

  return (
    <div className="h-screen w-full bg-background">
      <MessagingLayout initialChatId={chatId} />
    </div>
  );
}

const CraftsmanMessagesPage = () => {
  return (
    <Redirect requireAuth={true} allowedRoles={['craftsman']}>
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
        <CraftsmanMessagesContent />
      </Suspense>
    </Redirect>
  );
};

export default CraftsmanMessagesPage;
