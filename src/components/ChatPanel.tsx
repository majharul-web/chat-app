"use client";

import MessageInput from "@/components/MessageInput";
import MessageList from "@/components/MessageList";
import { useSocket } from "@/hooks/useSocket";
import {
  Conversation,
  createConversation,
  getConversations,
  getMessages,
  Message,
  searchUsers,
  sendMessage,
  User,
} from "@/lib/api";
import { useCallback, useEffect, useRef, useState } from "react";

interface ChatPanelProps {
  token: string;
  currentUserId: string;
  onLogout: () => void;
}

export default function ChatPanel({ token, currentUserId, onLogout }: ChatPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<
    Record<string, { messages: any[]; hasMore: boolean; lastMessageId?: string }>
  >({});
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConvType, setNewConvType] = useState<"direct" | "group">("direct");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<Record<string, string | undefined>>({});
  const selectedConversationIdRef = useRef<string | null>(null);
  const messagePollRef = useRef<NodeJS.Timeout | null>(null);

  const { isConnected, joinConversation, leaveConversation, consumeMessage } = useSocket(token);

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    setError(null);
    try {
      const data = await getConversations(token);
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
    } finally {
      setIsLoadingConversations(false);
    }
  }, [token]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedConversation) {
      selectedConversationIdRef.current = selectedConversation._id;

      const loadMessages = async () => {
        setIsLoadingMessages(true);
        try {
          const data = await getMessages(token, selectedConversation._id);
          setMessages((prev) => {
            const lastId = data.messages.length > 0 ? data.messages[data.messages.length - 1]._id : undefined;
            lastMessageIdRef.current = {
              ...lastMessageIdRef.current,
              [selectedConversation._id]: lastId,
            };
            return {
              ...prev,
              [selectedConversation._id]: {
                messages: data.messages,
                hasMore: data.hasMore,
                lastMessageId: lastId,
              },
            };
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load messages");
        } finally {
          setIsLoadingMessages(false);
        }
      };

      loadMessages();

      if (isConnected) {
        joinConversation(selectedConversation._id);
      }

      return () => {
        if (isConnected) {
          leaveConversation(selectedConversation._id);
        }
      };
    }
  }, [selectedConversation?._id, token, isConnected, joinConversation, leaveConversation]);

  useEffect(() => {
    if (selectedConversation) {
      const incomingMessages = consumeMessage(selectedConversation._id);
      if (incomingMessages.length > 0) {
        setMessages((prev) => {
          const current = prev[selectedConversation._id] || { messages: [], hasMore: false };
          const existingIds = new Set(current.messages.map((m: any) => m._id));
          const trulyNew = incomingMessages.filter((m: Message) => !existingIds.has(m._id));

          if (trulyNew.length === 0) return prev;

          const newLastId = trulyNew[trulyNew.length - 1]._id;
          lastMessageIdRef.current = {
            ...lastMessageIdRef.current,
            [selectedConversation._id]: newLastId,
          };

          return {
            ...prev,
            [selectedConversation._id]: {
              messages: [...current.messages, ...trulyNew],
              hasMore: current.hasMore,
              lastMessageId: newLastId,
            },
          };
        });
      }
    }
  }, [selectedConversation, consumeMessage]);

  useEffect(() => {
    if (!selectedConversation) return;

    const pollMessages = async () => {
      try {
        const data = await getMessages(token, selectedConversation._id);
        setMessages((prev) => {
          const current = prev[selectedConversation._id] || { messages: [], hasMore: false };
          const lastKnownId = lastMessageIdRef.current[selectedConversation._id];
          const newMessages = data.messages.filter((m: any) => m._id !== lastKnownId);
          const existingIds = new Set(current.messages.map((m: any) => m._id));
          const trulyNew = newMessages.filter((m: any) => !existingIds.has(m._id));

          if (trulyNew.length === 0) return prev;

          const newLastId = trulyNew[trulyNew.length - 1]._id;
          lastMessageIdRef.current = {
            ...lastMessageIdRef.current,
            [selectedConversation._id]: newLastId,
          };

          return {
            ...prev,
            [selectedConversation._id]: {
              messages: [...current.messages, ...trulyNew],
              hasMore: data.hasMore,
              lastMessageId: newLastId,
            },
          };
        });
      } catch {
        // silent
      }
    };

    messagePollRef.current = setInterval(pollMessages, 2000);

    return () => {
      if (messagePollRef.current) {
        clearInterval(messagePollRef.current);
        messagePollRef.current = null;
      }
    };
  }, [selectedConversation?._id, token]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedConversation) return;

    try {
      const message = await sendMessage(token, selectedConversation._id, text);
      setMessages((prev) => {
        const current = prev[selectedConversation._id] || { messages: [], hasMore: false };
        lastMessageIdRef.current = {
          ...lastMessageIdRef.current,
          [selectedConversation._id]: message._id,
        };
        return {
          ...prev,
          [selectedConversation._id]: {
            messages: [...current.messages, message],
            hasMore: current.hasMore,
            lastMessageId: message._id,
          },
        };
      });
      await loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  const handleCreateConversation = async () => {
    if (!selectedUserId) return;

    setIsCreating(true);
    setError(null);
    try {
      const conversation = await createConversation(
        token,
        selectedUserId,
        newConvType,
        newConvType === "group" ? groupName : undefined,
      );
      setConversations((prev) => [conversation, ...prev]);
      setSelectedConversation(conversation);
      setShowNewConversation(false);
      setSelectedUserId("");
      setGroupName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create conversation");
    } finally {
      setIsCreating(false);
    }
  };

  const handleLoadMoreMessages = async () => {
    if (!selectedConversation) return;

    try {
      const data = await getMessages(token, selectedConversation._id);
      setMessages((prev) => {
        const current = prev[selectedConversation._id] || { messages: [], hasMore: false };
        const lastId =
          data.messages.length > 0 ? data.messages[data.messages.length - 1]._id : current.lastMessageId;
        lastMessageIdRef.current = {
          ...lastMessageIdRef.current,
          [selectedConversation._id]: lastId,
        };
        return {
          ...prev,
          [selectedConversation._id]: {
            messages: [...data.messages, ...current.messages],
            hasMore: data.hasMore,
            lastMessageId: lastId,
          },
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more messages");
    }
  };

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
          const users = await searchUsers(token, query);
          setSearchResults(users.filter((u) => u._id !== currentUserId));
          setShowSearch(true);
        } catch (err) {
          console.error("Search failed:", err);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [token, currentUserId],
  );

  const handleUserClick = async (user: User) => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);

    const existing = conversations.find((c) => c.participant?._id === user._id);
    if (existing) {
      setSelectedConversation(existing);
      return;
    }

    try {
      const conversation = await createConversation(token, user._id, "direct");
      setConversations((prev) => [conversation, ...prev]);
      setSelectedConversation(conversation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start conversation");
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (messagePollRef.current) {
        clearInterval(messagePollRef.current);
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const currentMessages = selectedConversation ? messages[selectedConversation._id]?.messages || [] : [];
  const hasMore = selectedConversation ? messages[selectedConversation._id]?.hasMore || false : false;

  return (
    <div className='flex h-screen bg-gray-100'>
      <div className='w-80 flex-shrink-0'>
        <div className='flex flex-col h-full bg-white border-r border-gray-200'>
          <div className='p-4 border-b border-gray-200'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-semibold text-gray-900'>Messages</h2>
              <div className='flex gap-2'>
                <button
                  onClick={() => setShowNewConversation(true)}
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
                placeholder='Search conversations...'
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowSearch(true)}
                className='w-full px-4 py-2 pl-10 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition'
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
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition ${
                    selectedConversation?._id === conv._id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                        conv.type === "group" ? "bg-purple-500" : "bg-blue-500"
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
      </div>

      <div className='flex-1 flex flex-col'>
        {selectedConversation ? (
          <>
            <div className='bg-white border-b border-gray-200 px-6 py-4'>
              <h2 className='text-lg font-semibold text-gray-900'>
                {selectedConversation.type === "group"
                  ? `Group ${selectedConversation._id.slice(-4)}`
                  : selectedConversation.participant?.name || "Conversation"}
              </h2>
              <p className='text-sm text-gray-500'>
                {selectedConversation.type === "group"
                  ? "Group conversation"
                  : selectedConversation.participant?.phone || ""}
              </p>
            </div>
            <MessageList
              messages={currentMessages}
              currentUserId={currentUserId}
              isLoading={isLoadingMessages}
              hasMore={hasMore}
              onLoadMore={handleLoadMoreMessages}
              participants={{
                [currentUserId]: { name: 'You', phone: '' },
                ...(selectedConversation.participant ? {
                  [selectedConversation.participant._id]: {
                    name: selectedConversation.participant.name,
                    phone: selectedConversation.participant.phone,
                  }
                } : {}),
              }}
            />
            <MessageInput onSend={handleSendMessage} disabled={false} />
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center text-gray-500'>
              <svg
                className='w-16 h-16 mx-auto mb-4 text-gray-300'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                />
              </svg>
              <h3 className='text-lg font-medium mb-2'>Select a conversation</h3>
              <p>Choose a conversation from the list or start a new one</p>
            </div>
          </div>
        )}
      </div>

      {showNewConversation && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-semibold mb-4'>New Conversation</h3>

            <div className='flex gap-2 mb-4'>
              <button
                onClick={() => setNewConvType("direct")}
                className={`flex-1 py-2 px-4 rounded-md border transition ${
                  newConvType === "direct"
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                Direct Message
              </button>
              <button
                onClick={() => setNewConvType("group")}
                className={`flex-1 py-2 px-4 rounded-md border transition ${
                  newConvType === "group"
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                Group
              </button>
            </div>

            {newConvType === "direct" ? (
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>User ID</label>
                <input
                  type='text'
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none'
                  placeholder='Enter user ID'
                />
              </div>
            ) : (
              <>
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Group Name</label>
                  <input
                    type='text'
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none'
                    placeholder='Enter group name'
                  />
                </div>
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Participant User IDs (comma-separated)
                  </label>
                  <input
                    type='text'
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none'
                    placeholder='user1, user2, user3'
                  />
                </div>
              </>
            )}

            <div className='flex gap-2 justify-end'>
              <button
                onClick={() => setShowNewConversation(false)}
                className='px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition'
              >
                Cancel
              </button>
              <button
                onClick={handleCreateConversation}
                disabled={isCreating || !selectedUserId}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition'
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className='fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md shadow-lg z-50'>
          {error}
          <button onClick={() => setError(null)} className='ml-3 text-red-500 hover:text-red-700'>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
