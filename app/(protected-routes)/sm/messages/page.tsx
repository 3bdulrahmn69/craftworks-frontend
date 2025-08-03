'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi2';
import MessagingLayout from '@/app/components/messages/messaging-layout';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import Redirect from '@/app/components/redirect';

function CraftsmanMessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get('chatId') || undefined;

  const handleGoBack = () => {
    // Go back to the previous page or craftsman dashboard
    router.back();
  };

  return (
    <div className="h-screen w-full bg-background">
      {/* Back Button Header */}
      <div className="bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <HiArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
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
