"use client";

import {
  formatDate,
  formatTime,
  getAvatarColor,
  getInitials,
  isSameGroup,
  shouldShowAvatar,
} from "@/lib/utils";
import { Message } from "@/types";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  participants?: Record<string, { name?: string; phone?: string }>;
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
  const initializedRef = useRef(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (!isLoading && messages.length > 0) {
      const firstId = messages[0]?._id;
      if (prevFirstId.current !== firstId) {
        initializedRef.current = false;
        prevFirstId.current = firstId;
      }

      if (!initializedRef.current) {
        initializedRef.current = true;
        const container = containerRef.current;
        if (container) {
          const raf = requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
          });
          return () => cancelAnimationFrame(raf);
        }
      }
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length === 0) {
      initializedRef.current = false;
    }
  }, [messages.length]);

  useEffect(() => {
    if (messages.length === 0) {
      initializedRef.current = false;
    }
  }, [messages.length]);

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
            scrollToBottom(firstIdChanged ? "auto" : "smooth");
          }
        }
      }
    }

    prevMessagesLength.current = messages.length;
    prevFirstId.current = messages[0]?._id;
  }, [messages, isLoading, scrollToBottom]);

  const groupedMessages = useMemo(() => {
    const sorted = [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const groups: { date: string; messages: Message[] }[] = [];
    sorted.forEach((msg) => {
      const date = new Date(msg.createdAt).toDateString();
      const existingGroup = groups.find((g) => g.date === date);
      if (existingGroup) {
        existingGroup.messages.push(msg);
      } else {
        groups.push({ date, messages: [msg] });
      }
    });
    return groups;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className='flex-1 overflow-y-auto p-4'
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d2cf' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        backgroundColor: "var(--chat-bg)",
      }}
    >
      {hasMore && (
        <div className='text-center py-3'>
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className='text-sm text-primary hover:text-primary-dark disabled:text-gray-400 transition cursor-pointer'
          >
            {isLoading ? "Loading..." : "Load older messages"}
          </button>
        </div>
      )}

      {groupedMessages.map((group) => (
        <div key={group.date}>
          <div className='flex items-center justify-center my-4'>
            <div className='bg-white/90 backdrop-blur-sm text-gray-600 text-xs px-3 py-1.5 rounded-full shadow-sm border border-gray-200/50'>
              {formatDate(group.messages[0].createdAt)}
            </div>
          </div>

          <div className='space-y-1'>
            {group.messages.map((message, idx) => {
              const isCurrentUser = message.sender === currentUserId;
              const showAvatar = shouldShowAvatar(group.messages, idx);
              const grouped = isSameGroup(group.messages, idx);

              return (
                <div
                  key={message._id}
                  className={`flex items-end gap-2 ${isCurrentUser ? "flex-row-reverse" : "flex-row"} ${
                    grouped ? "mt-0.5" : "mt-3"
                  }`}
                >
                  {!isCurrentUser && (
                    <div
                      className={`w-8 h-8 rounded-full ${getAvatarColor(message.sender)} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-sm`}
                      title={
                        participants[message.sender]?.name || participants[message.sender]?.phone || "Unknown"
                      }
                    >
                      {getInitials(participants[message.sender]?.name, participants[message.sender]?.phone)}
                    </div>
                  )}
                  {isCurrentUser && showAvatar && (
                    <div
                      className={`w-8 h-8 rounded-full ${getAvatarColor(message.sender)} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-sm`}
                      title='You'
                    >
                      {getInitials(participants[message.sender]?.name, participants[message.sender]?.phone)}
                    </div>
                  )}
                  {isCurrentUser && !showAvatar && <div className='w-8 flex-shrink-0' />}

                  <div className={`max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"} flex flex-col`}>
                    <div
                      className={`px-3 py-2 shadow-sm ${
                        isCurrentUser
                          ? "bg-message-out text-gray-900 rounded-2xl rounded-tr-sm"
                          : "bg-message-in text-gray-900 rounded-2xl rounded-tl-sm border border-gray-100"
                      }`}
                    >
                      <p className='text-sm break-words leading-relaxed'>{message.text}</p>
                    </div>
                    {showAvatar && (
                      <span
                        className={`text-[11px] text-gray-500 mt-0.5 px-1 ${
                          isCurrentUser ? "text-right" : "text-left"
                        }`}
                      >
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
        <div className='flex items-center justify-center h-full'>
          <div className='text-center text-gray-500'>
            <svg
              className='w-16 h-16 mx-auto mb-3 text-gray-300'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              />
            </svg>
            <p className='text-sm'>No messages yet</p>
            <p className='text-xs mt-1 text-gray-400'>Send a message to start the conversation!</p>
          </div>
        </div>
      )}

      {isLoading && messages.length === 0 && (
        <div className='flex flex-col gap-3 px-4 py-2'>
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className={`flex items-end gap-2 ${idx % 2 === 0 ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className='w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0' />
              <div className={`max-w-[70%] ${idx % 2 === 0 ? "items-end" : "items-start"} flex flex-col`}>
                <div
                  className={`px-3 py-2 rounded-2xl ${
                    idx % 2 === 0
                      ? "rounded-tr-sm bg-gray-200"
                      : "rounded-tl-sm bg-gray-100 border border-gray-100"
                  }`}
                >
                  <div className='h-2.5 bg-gray-300/60 rounded w-24 animate-pulse' />
                </div>
                <div className='mt-1 px-1'>
                  <div className='h-2 bg-gray-200 rounded w-12 animate-pulse' />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading && messages.length > 0 && (
        <div className='flex items-center justify-center py-3'>
          <div className='w-5 h-5 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin' />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
