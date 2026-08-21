'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import { Message } from '@/lib/api';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  participants?: Record<string, { name?: string; phone?: string }>;
}

function getInitials(name?: string, phone?: string) {
  const source = name || phone || '?';
  const parts = source.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function shouldShowAvatar(messages: Message[], index: number) {
  if (index === messages.length - 1) return true;
  const next = messages[index + 1];
  return next.sender !== messages[index].sender || 
    new Date(next.createdAt).getTime() - new Date(messages[index].createdAt).getTime() > 60 * 1000;
}

function isSameGroup(messages: Message[], index: number) {
  if (index === 0) return false;
  const prev = messages[index - 1];
  const current = messages[index];
  return prev.sender === current.sender && 
    new Date(current.createdAt).getTime() - new Date(prev.createdAt).getTime() <= 60 * 1000;
}

export default function MessageList({
  messages,
  currentUserId,
  isLoading,
  hasMore,
  onLoadMore,
  participants = {},
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);
  const prevFirstId = useRef<string | undefined>(messages[0]?._id);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior });
    }
  }, []);

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const firstIdChanged = prevFirstId.current !== messages[0]?._id;
      const lengthIncreased = messages.length > prevMessagesLength.current;
      
      if (firstIdChanged || lengthIncreased) {
        const container = containerRef.current;
        if (container) {
          const { scrollTop, scrollHeight, clientHeight } = container;
          const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
          
          if (isAtBottom || firstIdChanged) {
            scrollToBottom(firstIdChanged ? 'auto' : 'smooth');
          }
        }
      }
    }
    
    prevMessagesLength.current = messages.length;
    prevFirstId.current = messages[0]?._id;
  }, [messages, isLoading, scrollToBottom]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    }
  };

  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    messages.forEach((msg) => {
      const date = new Date(msg.createdAt).toDateString();
      const existingGroup = groups.find(g => g.date === date);
      if (existingGroup) {
        existingGroup.messages.push(msg);
      } else {
        groups.push({ date, messages: [msg] });
      }
    });
    return groups;
  }, [messages]);

  const getAvatarColor = (senderId: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
    ];
    const index = senderId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto bg-gray-50">
      {hasMore && (
        <div className="text-center py-3">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 transition"
          >
            {isLoading ? 'Loading...' : 'Load older messages'}
          </button>
        </div>
      )}

      {groupedMessages.map((group) => (
        <div key={group.date}>
          <div className="flex items-center justify-center my-4">
            <div className="bg-white text-gray-600 text-xs px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
              {formatDate(group.messages[0].createdAt)}
            </div>
          </div>

          <div className="px-4 space-y-1">
            {group.messages.map((message, idx) => {
              const isCurrentUser = message.sender === currentUserId;
              const showAvatar = shouldShowAvatar(group.messages, idx);
              const grouped = isSameGroup(group.messages, idx);
              
              return (
                <div
                  key={message._id}
                  className={`flex items-end gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} ${
                    grouped ? 'mt-0.5' : 'mt-3'
                  }`}
                >
                  {!isCurrentUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-sm">
                      {getInitials(participants[message.sender]?.name, participants[message.sender]?.phone)}
                    </div>
                  )}
                  {isCurrentUser && showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-sm">
                      {getInitials(participants[message.sender]?.name, participants[message.sender]?.phone)}
                    </div>
                  )}
                  {isCurrentUser && !showAvatar && (
                    <div className="w-8 flex-shrink-0" />
                  )}

                  <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`px-3 py-2 shadow-sm ${
                        isCurrentUser
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-sm'
                          : 'bg-white text-gray-900 rounded-2xl rounded-tl-sm border border-gray-100'
                      }`}
                    >
                      <p className="text-sm break-words leading-relaxed">{message.text}</p>
                    </div>
                    {showAvatar && (
                      <span className={`text-[11px] text-gray-400 mt-0.5 px-1 ${
                        isCurrentUser ? 'text-right' : 'text-left'
                      }`}>
                        {formatTime(message.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1 text-gray-400">Send a message to start the conversation!</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
