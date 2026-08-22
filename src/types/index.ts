export interface User {
  _id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  type: 'direct' | 'group';
  lastMessage?: {
    text: string;
    sender: string;
    createdAt: string;
  };
  updatedAt: string;
  participant?: User;
  participants?: User[];
  name?: string;
  createdBy?: string;
  admins?: string[];
}

export interface ConversationWithDetails extends Conversation {
  participantDetails?: User[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
}
