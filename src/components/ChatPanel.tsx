"use client";

import MessageInput from "@/components/MessageInput";
import MessageList from "@/components/MessageList";
import UserSearchModal from "@/components/UserSearchModal";
import { useSocket } from "@/hooks/useSocket";
import { formatTime, getConversationSubtitle, getConversationTitle } from "@/lib/utils";
import {
  useCreateConversationMutation,
  useCreateGroupConversationMutation,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSearchUsersQuery,
  useSendMessageMutation,
} from "@/store/api/chatApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout as logoutAuth } from "@/store/slices/authSlice";
import {
  appendMessages,
  clearError,
  setConversations,
  setError,
  setGroupName,
  setIsCreating,
  setMessages,
  setModalSelectedUsers,
  setNewConvType,
  setSearchResults,
  setSelectedConversation,
  setShowNewConversation,
  setShowSearch,
} from "@/store/slices/chatSlice";
import { Conversation, User } from "@/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function ChatPanel() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const {
    conversations,
    selectedConversation,
    messages,
    error,
    showNewConversation,
    newConvType,
    modalSelectedUsers,
    groupName,
    isCreating,
    isSearching,
    showSearch,
    searchResults,
  } = useAppSelector((state) => state.chat);

  const lastMessageIdRef = useRef<Record<string, string | undefined>>({});
  const messagePollRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedConversationIdRef = useRef<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { isConnected, joinConversation, leaveConversation, consumeMessage } = useSocket(token);

  const { data: conversationsData, isLoading: isLoadingConversations } = useGetConversationsQuery(undefined, {
    // pollingInterval: 5000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (conversationsData) {
      dispatch(setConversations(conversationsData));
    }
  }, [conversationsData, dispatch]);

  const { data: messagesData, isLoading: isLoadingMessages } = useGetMessagesQuery(
    selectedConversation?._id || "",
    {
      skip: !selectedConversation,
      // pollingInterval: 2000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const { data: searchResultsData } = useSearchUsersQuery(searchQuery, {
    skip: !searchQuery.trim(),
  });

  useEffect(() => {
    if (messagesData && selectedConversation) {
      const lastId =
        messagesData.messages.length > 0
          ? messagesData.messages[messagesData.messages.length - 1]._id
          : undefined;
      lastMessageIdRef.current = {
        ...lastMessageIdRef.current,
        [selectedConversation._id]: lastId,
      };
      dispatch(
        setMessages({
          conversationId: selectedConversation._id,
          messages: messagesData.messages,
          hasMore: messagesData.hasMore,
          lastMessageId: lastId,
        }),
      );
    }
  }, [messagesData, selectedConversation, dispatch]);

  useEffect(() => {
    if (selectedConversation) {
      selectedConversationIdRef.current = selectedConversation._id;

      if (isConnected) {
        joinConversation(selectedConversation._id);
      }

      return () => {
        if (isConnected) {
          leaveConversation(selectedConversation._id);
        }
      };
    }
  }, [selectedConversation?._id, isConnected, joinConversation, leaveConversation]);

  useEffect(() => {
    if (selectedConversation) {
      const incomingMessages = consumeMessage(selectedConversation._id);
      if (incomingMessages.length > 0) {
        dispatch(
          appendMessages({
            conversationId: selectedConversation._id,
            messages: incomingMessages,
            lastMessageId: incomingMessages[incomingMessages.length - 1]._id,
          }),
        );
      }
    }
  }, [selectedConversation, consumeMessage, dispatch]);

  const [sendMessageMutation] = useSendMessageMutation();
  const [createConversationMutation] = useCreateConversationMutation();
  const [createGroupConversationMutation] = useCreateGroupConversationMutation();

  const handleSelectConversation = (conv: Conversation) => {
    dispatch(setSelectedConversation(conv));
    dispatch(clearError());
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedConversation) return;

    try {
      const message = await sendMessageMutation({
        conversationId: selectedConversation._id,
        text,
      }).unwrap();

      dispatch(
        appendMessages({
          conversationId: selectedConversation._id,
          messages: [message],
          lastMessageId: message._id,
        }),
      );
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : "Failed to send message"));
    }
  };

  const handleCreateConversation = async () => {
    if (modalSelectedUsers.length === 0) return;

    dispatch(setIsCreating(true));
    dispatch(clearError());

    try {
      let conversation: Conversation;
      if (newConvType === "direct") {
        const result = await createConversationMutation({
          userId: modalSelectedUsers[0]._id,
          type: "direct",
        }).unwrap();
        conversation = result;
      } else {
        const result = await createGroupConversationMutation({
          name: groupName,
          participantIds: modalSelectedUsers.map((u) => u._id),
        }).unwrap();
        conversation = result;
      }

      dispatch(setConversations([conversation, ...conversations]));
      dispatch(setSelectedConversation(conversation));
      dispatch(setShowNewConversation(false));
      dispatch(setModalSelectedUsers([]));
      dispatch(setGroupName(""));
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : "Failed to create conversation"));
    } finally {
      dispatch(setIsCreating(false));
    }
  };

  const handleSearch = useCallback(
    async (query: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (!query.trim()) {
        dispatch(setSearchResults([]));
        dispatch(setShowSearch(false));
        setSearchQuery("");
        return;
      }

      setSearchQuery(query);
    },
    [dispatch],
  );

  useEffect(() => {
    if (searchResultsData) {
      dispatch(setSearchResults(searchResultsData.filter((u: User) => u._id !== user?._id)));
      dispatch(setShowSearch(true));
    }
  }, [searchResultsData, user, dispatch]);

  const handleUserClick = async (user: User) => {
    dispatch(setShowSearch(false));

    const existing = conversations.find((c) => c.participant?._id === user._id);
    if (existing) {
      dispatch(setSelectedConversation(existing));
      return;
    }

    try {
      const conversation = await createConversationMutation({
        userId: user._id,
        type: "direct",
      }).unwrap();

      dispatch(setConversations([conversation, ...conversations]));
      dispatch(setSelectedConversation(conversation));
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : "Failed to start conversation"));
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

  const currentMessages = selectedConversation ? messages[selectedConversation._id]?.messages || [] : [];
  const hasMore = selectedConversation ? messages[selectedConversation._id]?.hasMore || false : false;

  const participants = useMemo(() => {
    if (!selectedConversation) return {};
    const participants: Record<string, { name?: string; phone?: string }> = {};
    if (user) {
      participants[user._id] = { name: "You", phone: "" };
    }
    if (selectedConversation.participant) {
      participants[selectedConversation.participant._id] = {
        name: selectedConversation.participant.name,
        phone: selectedConversation.participant.phone,
      };
    }
    return participants;
  }, [selectedConversation, user]);

  return (
    <div className='flex h-screen bg-background'>
      <div className='w-80 flex-shrink-0 bg-white border-r border-gray-200'>
        <div className='flex flex-col h-full'>
          <div className='p-4 bg-primary text-white'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-semibold'>Messages</h2>
              <div className='flex gap-2'>
                <button
                  onClick={() => dispatch(setShowNewConversation(true))}
                  className='p-2 hover:bg-white/20 rounded-full transition'
                  title='New Conversation'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    dispatch(logoutAuth());
                    router.push("/chat/login");
                  }}
                  className='p-2 hover:bg-white/20 rounded-full transition'
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
                placeholder='Search or start new chat'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                onFocus={() => searchQuery && dispatch(setShowSearch(true))}
                className='w-full px-4 py-2 pl-10 bg-white rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:ring focus:ring-white/50 focus:outline-none'
              />
              <svg
                className='w-4 h-4 text-gray-400 absolute left-3 top-2.5'
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
                <div className='absolute right-3 top-2.5'>
                  <div className='w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin' />
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

          <div className='flex-1 overflow-y-auto bg-white'>
            {isLoadingConversations && (!Array.isArray(conversations) || conversations.length === 0) ? (
              <div className='p-4 flex flex-col gap-3'>
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className='flex items-start gap-3 animate-pulse'>
                    <div className='w-12 h-12 rounded-full bg-gray-200 flex-shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <div className='h-4 bg-gray-200 rounded w-32 mb-2' />
                      <div className='h-3 bg-gray-100 rounded w-48' />
                    </div>
                  </div>
                ))}
              </div>
            ) : !Array.isArray(conversations) || conversations.length === 0 ? (
              <div className='p-4 text-center text-gray-500'>
                <p>No conversations yet</p>
                <p className='text-sm mt-1'>Search for someone to start chatting!</p>
              </div>
            ) : (
              conversations?.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition ${
                    selectedConversation?._id === conv._id ? "bg-background" : ""
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

      <div className='flex-1 flex flex-col bg-chat-bg'>
        {selectedConversation ? (
          <>
            <div className='bg-background border-b border-gray-200 px-6 py-3'>
              <div className='flex items-center gap-3'>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    selectedConversation.type === "group" ? "bg-purple-500" : "bg-blue-500"
                  }`}
                >
                  {selectedConversation.type === "group" ? (
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                    </svg>
                  ) : (
                    <span>{getConversationTitle(selectedConversation).charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h2 className='text-base font-semibold text-gray-900'>
                    {selectedConversation.type === "group"
                      ? `Group ${selectedConversation._id.slice(-4)}`
                      : selectedConversation.participant?.name || "Conversation"}
                  </h2>
                  <p className='text-xs text-gray-500'>
                    {selectedConversation.type === "group"
                      ? "Group conversation"
                      : selectedConversation.participant?.phone || ""}
                  </p>
                </div>
              </div>
            </div>
            <MessageList
              messages={currentMessages}
              currentUserId={user?._id || ""}
              isLoading={isLoadingMessages}
              hasMore={hasMore}
              onLoadMore={() => {}}
              participants={participants}
            />
            <MessageInput onSend={handleSendMessage} disabled={false} />
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center bg-background'>
            <div className='text-center text-gray-500'>
              <div className='w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm'>
                <svg
                  className='w-12 h-12 text-gray-300'
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
              </div>
              <h3 className='text-lg font-medium mb-2 text-gray-700'>ChatWithMe Web</h3>
              <p className='text-sm text-gray-500 max-w-sm mx-auto'>
                Send and receive messages without keeping your phone online. Use ChatWithMe on up to 4 linked
                devices and 1 mobile phone.
              </p>
            </div>
          </div>
        )}
      </div>

      {showNewConversation && (
        <UserSearchModal
          isOpen={showNewConversation}
          onClose={() => dispatch(setShowNewConversation(false))}
          token={token}
          currentUserId={user?._id ?? undefined}
          selectedUsers={modalSelectedUsers}
          onSelect={(users) => dispatch(setModalSelectedUsers(users))}
          convType={newConvType}
          onConvTypeChange={(type) => dispatch(setNewConvType(type))}
          groupName={groupName}
          onGroupNameChange={(name) => dispatch(setGroupName(name))}
          title='New Conversation'
          submitLabel={newConvType === "direct" ? "Start Chat" : "Create Group"}
          onSubmit={handleCreateConversation}
          isSubmitting={isCreating}
        />
      )}

      {error && (
        <div className='fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md shadow-lg z-50'>
          {error}
          <button onClick={() => dispatch(setError(null))} className='ml-3 text-red-500 hover:text-red-700'>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
