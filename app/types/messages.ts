// Message and Chat related types
export interface Chat {
  _id: string;
  participants: ChatParticipant[]; // Array of participant objects
  jobId?: {
    _id: string;
    title: string;
  };
  lastMessage?: string; // Just the content string
  lastMessageAt?: string; // Separate field for timestamp
  lastMessageSenderId?: string; // ID of the sender
  unreadCount?: { [userId: string]: number }; // Object with user IDs as keys
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  chatId: string;
  sender: {
    _id: string;
    fullName: string;
    profilePicture?: string;
    role: 'client' | 'craftsman';
  };
  messageType: 'text' | 'image';
  content: string;
  readBy: string[];
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ChatParticipant {
  _id: string;
  fullName: string;
  profilePicture?: string;
  role: 'client' | 'craftsman';
  isOnline?: boolean;
  lastSeen?: string;
}

export interface CreateChatRequest {
  craftsmanId: string;
  jobId?: string;
}

export interface SendMessageRequest {
  messageType: 'text' | 'image';
  content: string;
}

export interface ChatsApiResponse {
  success: boolean;
  data:
    | Chat[]
    | {
        chats: Chat[];
        totalCount: number;
        totalPages: number;
        currentPage: number;
      };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

export interface ChatApiResponse {
  success: boolean;
  data: Chat;
  message?: string;
}

export interface MessagesApiResponse {
  success: boolean;
  data:
    | Message[]
    | {
        messages: Message[];
        totalCount: number;
        totalPages: number;
        currentPage: number;
      };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

export interface MessageApiResponse {
  success: boolean;
  data: Message;
  message?: string;
}

// Socket.IO Events
export interface SocketEvents {
  // Client to Server
  'join-chat': (chatId: string) => void;
  'leave-chat': (chatId: string) => void;
  'send-message': (data: {
    chatId: string;
    content: string;
    messageType?: 'text' | 'image';
  }) => void;
  'typing-start': (chatId: string) => void;
  'typing-stop': (chatId: string) => void;
  'mark-read': (chatId: string) => void;

  // Server to Client
  'new-message': (message: Message) => void;
  'message-read': (data: {
    chatId: string;
    messageId: string;
    readBy: string;
  }) => void;
  'user-typing': (data: {
    chatId: string;
    userId: string;
    isTyping: boolean;
  }) => void;
  'user-online': (userId: string) => void;
  'user-offline': (userId: string) => void;
  'chat-updated': (chat: Chat) => void;
  error: (error: { message: string; code?: string }) => void;
}

export interface TypingIndicator {
  chatId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface OnlineStatus {
  [userId: string]: boolean;
}
