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
  participants?: string[];
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

export async function login(phone: string, name: string): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, name }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Login failed');
  }
  return res.json();
}

export async function getCurrentUser(token: string): Promise<User> {
  const res = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to get user');
  }
  return res.json();
}

export async function searchUsers(token: string, query: string): Promise<User[]> {
  const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Search failed');
  }
  return res.json();
}

export async function getConversations(token: string, type?: string): Promise<Conversation[]> {
  const url = type 
    ? `/api/conversations?type=${type}`
    : `/api/conversations`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to get conversations');
  }
  const data = await res.json();
  return data.data || data;
}

export async function createConversation(token: string, userId: string, type: 'direct' | 'group', name?: string): Promise<Conversation> {
  const body: Record<string, unknown> = { userId, type };
  if (type === 'group' && name) {
    body.name = name;
  }
  const res = await fetch('/api/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create conversation');
  }
  return res.json();
}

export async function getMessages(token: string, conversationId: string): Promise<MessagesResponse> {
  const res = await fetch(`/api/conversations/${conversationId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to get messages');
  }
  return res.json();
}

export async function sendMessage(token: string, conversationId: string, text: string): Promise<Message> {
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ conversationId, text }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to send message');
  }
  return res.json();
}
