import { Conversation, Message, User } from "@/types";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://frontend-task-chatapp.onrender.com";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Conversation", "Message", "User"],
  endpoints: (builder) => ({
    login: builder.mutation<{ token: string; user: User }, { phone: string; name: string }>({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        body,
      }),
    }),

    getCurrentUser: builder.query<User, void>({
      query: () => "/api/auth/me",
      providesTags: ["User"],
    }),

    searchUsers: builder.query<User[], string>({
      query: (q) => `/api/users/search?q=${encodeURIComponent(q)}`,
      providesTags: ["User"],
    }),

    getConversations: builder.query<Conversation[], string | void>({
      query: (type) => ({
        url: "/api/conversations",
        params: type ? { type } : {},
      }),
      transformResponse: (response: { data: Conversation[] } | Conversation[]) => {
        if (Array.isArray(response)) return response;
        return response?.data || [];
      },
      providesTags: ["Conversation"],
    }),

    createConversation: builder.mutation<
      Conversation,
      { userId: string; type: "direct" | "group"; name?: string }
    >({
      query: (body) => ({
        url: "/api/conversations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Conversation"],
    }),

    createGroupConversation: builder.mutation<
      Conversation,
      { name: string; participantIds: string[] }
    >({
      query: (body) => ({
        url: "/api/conversations/group",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Conversation"],
    }),

    getMessages: builder.query<{ messages: Message[]; hasMore: boolean }, string>({
      query: (conversationId) => `/api/conversations/${conversationId}/messages`,
      providesTags: ["Message"],
    }),

    sendMessage: builder.mutation<Message, { conversationId: string; text: string }>({
      query: (body) => ({
        url: "/api/messages",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Message", "Conversation"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetCurrentUserQuery,
  useSearchUsersQuery,
  useGetConversationsQuery,
  useCreateConversationMutation,
  useCreateGroupConversationMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
} = chatApi;
