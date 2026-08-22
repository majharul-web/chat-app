# ChatWithMe API Documentation

## Base URL

```
https://frontend-task-chatapp.onrender.com
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Login / Register User

**Endpoint:** `POST /api/auth/login`

Registers a new user or logs in an existing user. There is no separate registration flow.

**Request Body:**

```json
{
  "phone": "string (required)",
  "name": "string (required)"
}
```

**Response 200 OK:**

```json
{
  "token": "string (JWT token)",
  "user": {
    "_id": "string",
    "name": "string",
    "phone": "string",
    "createdAt": "string (ISO 8601)"
  }
}
```

**Error Response:**

```json
{
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "path": "phone",
      "message": "Required"
    }
  ]
}
```

---

### 2. Get Current User

**Endpoint:** `GET /api/auth/me`

Returns the currently authenticated user's profile.

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200 OK:**

```json
{
  "_id": "string",
  "name": "string",
  "phone": "string",
  "createdAt": "string (ISO 8601)"
}
```

---

### 3. Search Users

**Endpoint:** `GET /api/users/search?q={query}`

Searches for users by name or phone number.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `q` (string, required): Search query

**Response 200 OK:**

```json
[
  {
    "_id": "string",
    "name": "string",
    "phone": "string"
  }
]
```

---

### 4. Get Conversations

**Endpoint:** `GET /api/conversations`

Returns all conversations for the current user.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `type` (string, optional): Filter by conversation type (`direct` or `group`)

**Response 200 OK:**

```json
{
  "data": [
    {
      "_id": "string",
      "type": "direct | group",
      "lastMessage": {
        "text": "string",
        "sender": "string",
        "createdAt": "string (ISO 8601)"
      },
      "updatedAt": "string (ISO 8601)",
      "participant": {
        "_id": "string",
        "name": "string",
        "phone": "string"
      }
    }
  ]
}
```

---

### 5. Create Conversation

**Endpoint:** `POST /api/conversations`

Creates a new direct conversation.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "userId": "string (required)",
  "type": "direct (required)"
}
```

**Response 201 Created:**

```json
{
  "_id": "string",
  "participants": ["string"],
  "createdAt": "string (ISO 8601)"
}
```

---

### 5a. Create Group Conversation

**Endpoint:** `POST /api/conversations/group`

Creates a new group conversation. The creator becomes an admin.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "string (required)",
  "participantIds": [
    "string"
  ]
}
```

**Response 201 Created:**

```json
{
  "_id": "string",
  "participants": ["string"],
  "createdAt": "string (ISO 8601)"
}
```

---

### 6. Get Messages

**Endpoint:** `GET /api/conversations/{conversationId}/messages`

Returns messages for a specific conversation.

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200 OK:**

```json
{
  "messages": [
    {
      "_id": "string",
      "conversation": "string",
      "sender": "string",
      "text": "string",
      "createdAt": "string (ISO 8601)"
    }
  ],
  "hasMore": "boolean"
}
```

---

### 7. Send Message

**Endpoint:** `POST /api/messages`

Sends a new message to a conversation.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "conversationId": "string (required)",
  "text": "string (required)"
}
```

**Response 201 Created:**

```json
{
  "_id": "string",
  "conversation": "string",
  "sender": "string",
  "text": "string",
  "createdAt": "string (ISO 8601)"
}
```

---

## WebSocket (Socket.IO)

Connect to the Socket.IO server for real-time updates:

**URL:** `wss://frontend-task-chatapp.onrender.com/socket.io/`

**Authentication:**

```javascript
const socket = io("wss://frontend-task-chatapp.onrender.com", {
  auth: {
    token: "Bearer <jwt_token>",
  },
});
```

**Events:**

| Event                | Direction       | Payload                  | Description                       |
| -------------------- | --------------- | ------------------------ | --------------------------------- |
| `connect`            | Server → Client | -                        | Connection established            |
| `disconnect`         | Server → Client | -                        | Connection closed                 |
| `message:received`   | Server → Client | `Message` object         | New message received in real-time |
| `conversation:join`  | Client → Server | `conversationId: string` | Join a conversation room          |
| `conversation:leave` | Client → Server | `conversationId: string` | Leave a conversation room         |

**Message Object:**

```json
{
  "_id": "string",
  "conversation": "string",
  "sender": "string",
  "text": "string",
  "createdAt": "string (ISO 8601)"
}
```

---

## Error Codes

| Code               | Description                 |
| ------------------ | --------------------------- |
| `VALIDATION_ERROR` | Request validation failed   |
| `NOT_FOUND`        | Resource not found          |
| `NO_TOKEN`         | Authorization token missing |
| `INVALID_TOKEN`    | Authorization token invalid |

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- The API uses JWT tokens for authentication
- New phone numbers are automatically registered as new users on login
- Empty messages cannot be sent (validation enforced server-side)
- Real-time updates are delivered via Socket.IO for subscribed conversations
