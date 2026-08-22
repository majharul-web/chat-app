"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Conversation, User } from "@/types";
import { formatConversationTime, getAvatarColor } from "@/lib/utils";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
  token: string;
  currentUserId: string;
  onLogout: () => void;
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNewConversation,
  token,
  currentUserId,
  onLogout,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (!query.trim()) {
        setSearchResults([]);
        setShowSearch(false);
        return;
      }

      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          setSearchResults(data.filter((u: User) => u._id !== currentUserId));
          setShowSearch(true);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [token, currentUserId],
  );

  const handleUserClick = (user: User) => {
    onSelect({
      _id: `temp-${user._id}`,
      type: "direct",
      participant: user,
      updatedAt: new Date().toISOString(),
    } as Conversation);
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const getConversationTitle = (conv: Conversation) => {
    if (conv.type === "group") {
      return `Group ${conv._id.slice(-4)}`;
    }
    if (conv.participant) {
      return conv.participant.name || conv.participant.phone;
    }
    return "Unknown";
  };

  const getConversationSubtitle = (conv: Conversation) => {
    if (conv.lastMessage) {
      return conv.lastMessage.text || "";
    }
    return "No messages yet";
  };

  const formatTime = formatConversationTime;

  return (
    <div className='flex flex-col h-full bg-white border-r border-gray-200'>
      <div className='p-4 border-b border-gray-200'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-semibold text-gray-900'>Messages</h2>
          <div className='flex gap-2'>
            <button
              onClick={onNewConversation}
              className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition'
              title='New Conversation'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
              </svg>
            </button>
            <button
              onClick={onLogout}
              className='p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition'
              title='Logout'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                />
              </svg>
            </button>
          </div>
        </div>

        <div className='relative'>
          <input
            type='text'
            placeholder='Search by name or phone...'
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery && setShowSearch(true)}
            className='w-full px-4 py-2 pl-10 border border-gray-300 rounded-full text-sm focus:ring focus:ring-blue-500 focus:border-transparent outline-none transition'
          />
          <svg
            className='w-4 h-4 text-gray-400 absolute left-3 top-3'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
          {isSearching && (
            <div className='absolute right-3 top-3'>
              <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' />
            </div>
          )}
        </div>

        {showSearch && searchResults.length > 0 && (
          <div className='absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto'>
            {searchResults.map((user) => (
              <button
                key={user._id}
                onClick={() => handleUserClick(user)}
                className='w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition'
              >
                <div className='font-medium text-gray-900'>{user.name}</div>
                <div className='text-sm text-gray-500'>{user.phone}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className='flex-1 overflow-y-auto'>
        {conversations.length === 0 ? (
          <div className='p-4 text-center text-gray-500'>
            <p>No conversations yet</p>
            <p className='text-sm mt-1'>Search for someone to start chatting!</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => onSelect(conv)}
              className={`group w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition ${
                selectedId === conv._id ? "bg-blue-50" : ""
              }`}
            >
              <div className='flex items-start gap-3'>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                    conv.type === "group" ? "bg-purple-500" : getAvatarColor(conv.participant?._id || conv._id)
                  }`}
                >
                  {conv.type === "group" ? (
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                    </svg>
                  ) : (
                    <span>{getConversationTitle(conv).charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <h3 className='font-medium text-gray-900 truncate'>{getConversationTitle(conv)}</h3>
                    {conv.updatedAt && (
                      <span className='text-xs text-gray-500 flex-shrink-0'>
                        {formatTime(conv.updatedAt)}
                      </span>
                    )}
                  </div>
                  <p className='text-sm text-gray-500 truncate mt-0.5'>{getConversationSubtitle(conv)}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
