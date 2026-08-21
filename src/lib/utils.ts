export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

export function formatConversationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (days === 1) {
    return 'Yesterday';
  }
  if (days < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function getInitials(name?: string, phone?: string): string {
  const source = name || phone || '?';
  const parts = source.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function shouldShowAvatar(messages: { sender: string; createdAt: string }[], index: number): boolean {
  if (index === messages.length - 1) return true;
  const next = messages[index + 1];
  return next.sender !== messages[index].sender ||
    new Date(next.createdAt).getTime() - new Date(messages[index].createdAt).getTime() > 60 * 1000;
}

export function isSameGroup(messages: { sender: string; createdAt: string }[], index: number): boolean {
  if (index === 0) return false;
  const prev = messages[index - 1];
  const current = messages[index];
  return prev.sender === current.sender &&
    new Date(current.createdAt).getTime() - new Date(prev.createdAt).getTime() <= 60 * 1000;
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
