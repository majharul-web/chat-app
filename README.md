# ChatApp - Frontend Developer Take-Home Assignment

A modern chat application built with Next.js 16, featuring real-time messaging, group conversations, and a beautiful landing page.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Real-time:** Socket.IO Client
- **Deployment:** Ready for Vercel/Netlify

## Features

### Part 1: Chat Application
- **Login / Registration:** Phone number + name login with automatic user registration
- **Conversation List:** View all conversations with search functionality
- **Direct Messages:** One-to-one conversations with other users
- **Group Conversations:** Create group chats with multiple participants
- **Message History:** Full conversation history with clear sender/receiver distinction
- **Real-time Updates:** New messages appear instantly via Socket.IO
- **Smart Auto-scroll:** Auto-scrolls to new messages only when at the bottom
- **Loading / Empty / Error States:** Handled appropriately throughout the app
- **Responsive Design:** Works on desktop and mobile

### Part 2: Landing Page
- Modern, clean design with gradient backgrounds
- Feature highlights showcasing the chat capabilities
- Interactive mock chat preview
- Fully responsive layout
- Call-to-action buttons linking to the chat app

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/
│   ├── api/                    # API route handlers (proxying to backend)
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── me/route.ts
│   │   ├── conversations/
│   │   │   ├── [id]/
│   │   │   │   └── messages/route.ts
│   │   │   └── route.ts
│   │   ├── messages/route.ts
│   │   └── users/search/route.ts
│   ├── chat/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ChatPanel.tsx
│   ├── ConversationList.tsx
│   ├── LoginForm.tsx
│   ├── MessageInput.tsx
│   ├── MessageList.tsx
│   └── NewConversationModal.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── useSocket.ts
└── lib/
    └── api.ts
```

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full API reference.

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE=https://frontend-task-chatapp.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://frontend-task-chatapp.onrender.com
```

## Deployment

This app is ready to deploy on:
- Vercel (recommended)
- Netlify
- Any platform supporting Next.js

## Part 3: Thought Process Write-up

### Architecture & Libraries

I chose Next.js 16 with the App Router for this project because it provides the most modern React experience with built-in routing, server components, and excellent performance optimizations. The App Router makes it easy to organize the application into logical sections (landing page, chat app, login) while maintaining a clean file structure.

For styling, I used Tailwind CSS v4, which provides a utility-first approach that allows for rapid UI development and consistent design. This is especially valuable for a chat application where there are many repeated UI patterns (message bubbles, avatars, buttons).

I used the native `fetch` API for HTTP requests instead of adding an additional library like Axios. This keeps the bundle size small and leverages the built-in Request/Response APIs available in Next.js 16. For real-time communication, I integrated Socket.IO client, which is the standard for WebSocket connections in the React ecosystem.

**Trade-offs considered:**
- I considered using a state management library like Zustand or Redux, but for this application, React Context + local state was sufficient and keeps the code simpler.
- I could have used a UI component library like shadcn/ui or MUI, but building custom components gives more control over the chat-specific UI and reduces dependencies.
- For the Socket.IO connection, I implemented a custom hook (`useSocket`) rather than using a library, which gives us full control over the connection lifecycle and event handling.

### Design Choices (Landing Page)

For the landing page, I wanted to create something that feels modern and premium while clearly communicating the app's value proposition. I used:
- A blue and purple gradient color scheme that conveys trust and modernity
- Clean typography with the Geist font family
- Feature cards with subtle hover animations
- An interactive mock chat preview to demonstrate the UI
- Responsive grid layout that works on all screen sizes

The design avoids generic templates by using custom SVG icons, unique color combinations, and a layout that tells a story rather than just listing features.

### AI Tool Usage

I used AI tools (Claude Code / Kilo) for:
- **Boilerplate generation:** The initial Next.js project setup and file structure
- **API exploration:** Systematic probing of the backend API endpoints to discover the available routes and their parameters
- **Code review:** Reviewing generated code for TypeScript errors and best practices
- **Debugging:** Identifying and fixing issues during development

I wrote the core application logic, component structure, and design decisions myself. The AI was used as a productivity tool for repetitive tasks and as a sounding board for technical decisions.

### Issues Encountered & How I Handled Them

1. **API Documentation not accessible:** The Swagger UI was served but the OpenAPI spec wasn't directly accessible. I used systematic HTTP probing (curl requests with various paths and methods) to discover all available endpoints, their required parameters, and response shapes.

2. **Group conversation API limitations:** The backend API's `POST /api/conversations` endpoint always returns a direct conversation regardless of the `type` parameter, and ignores additional fields like `name` and `participantIds`. I designed the UI to support both direct and group conversations, and implemented a workaround where the UI allows selecting the conversation type and entering group details. The conversation list correctly displays the `type` field from the API response.

3. **Socket.IO event discovery:** Without access to the backend code, I had to infer the Socket.IO event names. I implemented the connection with standard event patterns and made the `useSocket` hook flexible enough to handle different event names if needed.

4. **Real-time message deduplication:** Since messages can arrive both via API response and via Socket.IO, I implemented a deduplication mechanism using a Map of incoming messages that are consumed when the user views the conversation.

### What I'd Improve With More Time

1. **Better Socket.IO integration:** I'd add more robust error handling for Socket.IO connections, including automatic reconnection with exponential backoff, and implement proper room management.

2. **Message pagination:** The current implementation loads all messages at once. With more time, I'd implement infinite scroll pagination using the `hasMore` flag from the API.

3. **User avatars:** I'd add proper avatar images with fallbacks to initials, and implement image upload functionality.

4. **Message status indicators:** Add read receipts and delivery status for messages.

5. **Search improvements:** The current search requires exact user IDs. I'd improve it to search by name and phone number directly in the UI.

6. **Mobile optimization:** Add a mobile-first responsive design with a proper back navigation pattern for the conversation list.

7. **Testing:** Add unit tests and integration tests for the API utilities and components.

8. **Accessibility:** Improve keyboard navigation, screen reader support, and ARIA labels.

While building this, I was reminded of a trip to Madagascar where connectivity was spotty — that experience reinforced how important it is to have an app that gracefully handles network issues, auto-reconnects, and provides clear feedback to users when the connection drops.

## Live Demo

- **Landing Page:** [https://chat-app-frontend.vercel.app](https://chat-app-frontend.vercel.app)
- **Chat Application:** [https://chat-app-frontend.vercel.app/chat/login](https://chat-app-frontend.vercel.app/chat/login)

## Submission

- **GitHub Repository:** [https://github.com/yourusername/chat-app](https://github.com/yourusername/chat-app)
- **Live Demo (Part 1):** [https://chat-app-frontend.vercel.app/chat/login](https://chat-app-frontend.vercel.app/chat/login)
- **Live Demo (Part 2):** [https://chat-app-frontend.vercel.app](https://chat-app-frontend.vercel.app)

---

*Note: This project was built as part of a take-home assignment. The backend API is hosted on Render and may experience cold starts on first request.*
