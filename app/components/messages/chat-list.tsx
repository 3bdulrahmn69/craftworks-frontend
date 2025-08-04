'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { Chat, ChatParticipant } from '@/app/types/messages';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import Image from 'next/image';
import { HiUserCircle } from 'react-icons/hi2';
import { BiMessageDetail } from 'react-icons/bi';

interface ChatListProps {
  chats: Chat[];
  currentUserId: string;
  selectedChatId?: string;
  onChatSelect: (chat: Chat) => void;
  loading?: boolean;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  currentUserId,
  selectedChatId,
  onChatSelect,
  loading = false,
}) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const dateLocale = locale === 'ar' ? ar : enUS;

  const getOtherParticipant = (chat: Chat): ChatParticipant | null => {
    // Find the other participant (not the current user)
    const otherParticipant = chat.participants.find(
      (participant) => participant._id !== currentUserId
    );

    return otherParticipant || null;
  };

  const formatLastMessageTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: dateLocale,
      });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            {locale === 'ar' ? 'جاري تحميل المحادثات...' : 'Loading chats...'}
          </p>
        </div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6">
          <BiMessageDetail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {locale === 'ar' ? 'لا توجد محادثات' : 'No conversations'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {locale === 'ar'
              ? 'ابدأ محادثة جديدة مع عميل أو حرفي'
              : 'Start a new conversation with a client or craftsman'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-1 p-2">
        {chats.map((chat) => {
          const otherParticipant = getOtherParticipant(chat);
          const isSelected = selectedChatId === chat._id;
          const unreadCount = chat.unreadCount?.[currentUserId] || 0;
          const hasUnread = unreadCount > 0;

          return (
            <div
              key={chat._id}
              onClick={() => {
                console.log('🔍 ChatList: User clicked chat:', chat._id);
                console.log('🔍 ChatList: Chat data:', chat);

                // Validate before passing
                if (
                  !chat ||
                  !chat._id ||
                  !chat.participants ||
                  !Array.isArray(chat.participants)
                ) {
                  console.error(
                    '🚨 ChatList: Invalid chat data before selection:',
                    chat
                  );
                  return;
                }

                onChatSelect(chat);
              }}
              className={`
                relative p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50
                ${
                  isSelected
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-accent/30'
                }
                ${isRTL ? 'text-right' : 'text-left'}
              `}
            >
              <div
                className={`flex items-center gap-3 ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {otherParticipant?.profilePicture ? (
                    <Image
                      src={otherParticipant.profilePicture}
                      alt={otherParticipant.fullName}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                      style={{ width: '40px', height: '40px' }}
                    />
                  ) : (
                    <HiUserCircle className="w-10 h-10 text-muted-foreground" />
                  )}

                  {/* Online indicator */}
                  {otherParticipant?.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                  )}
                </div>

                {/* Chat info */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`flex items-center justify-between mb-1 ${
                      isRTL ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {otherParticipant?.fullName || 'Unknown User'}
                    </h4>

                    {chat.lastMessage && chat.lastMessageAt && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatLastMessageTime(chat.lastMessageAt)}
                      </span>
                    )}
                  </div>

                  <div
                    className={`flex items-center justify-between ${
                      isRTL ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {chat.lastMessage ? (
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {typeof chat.lastMessage === 'string'
                          ? chat.lastMessage
                          : locale === 'ar'
                          ? 'رسالة'
                          : 'Message'}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        {locale === 'ar' ? 'لا توجد رسائل' : 'No messages'}
                      </p>
                    )}

                    {/* Unread count */}
                    {hasUnread && (
                      <div className="flex-shrink-0 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full min-w-[20px] text-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
