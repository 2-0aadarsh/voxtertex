# VoxVertex Messaging API Documentation

## Overview
This document provides comprehensive API documentation for the VoxVertex messaging system. The system supports real-time messaging between speakers and organizers with admin oversight capabilities.

## Base URL
```
http://localhost:3001/api
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Socket.IO Connection
For real-time features, connect to Socket.IO with authentication:
```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

---

## 🚀 Quick Start Testing (Postman)

### 1. Authentication
First, get a JWT token by logging in:
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

### 2. Create Sample Conversation
```
POST /api/messaging-test/create-sample-conversation
Authorization: Bearer <your-token>
```

### 3. Send Test Message
```
POST /api/messaging-test/send-sample-message/{conversationId}
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "content": "Hello! This is a test message from Postman."
}
```

### 4. Get Your Conversations
```
GET /api/messaging-test/my-conversations
Authorization: Bearer <your-token>
```

### 5. Get Messages from Conversation
```
GET /api/messaging-test/conversation/{conversationId}/messages
Authorization: Bearer <your-token>
```

---

## 📱 User Messaging Endpoints

### Create or Get Conversation
```
POST /api/messaging/conversations
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "participantId": "user-id-to-chat-with",
  "type": "direct",
  "context": {
    "topic": "Event Discussion"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation retrieved successfully",
  "conversation": {
    "_id": "conversation-id",
    "participants": [...],
    "type": "direct",
    "lastMessage": {...},
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get User Conversations
```
GET /api/messaging/conversations?limit=20&skip=0&status=active
Authorization: Bearer <your-token>
```

### Send Message
```
POST /api/messaging/conversations/{conversationId}/messages
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "content": "Hello! How are you?",
  "messageType": "text",
  "replyTo": "message-id-to-reply-to",
  "attachments": []
}
```

### Get Conversation Messages
```
GET /api/messaging/conversations/{conversationId}/messages?limit=50&skip=0
Authorization: Bearer <your-token>
```

### Mark Messages as Read
```
PUT /api/messaging/conversations/{conversationId}/read
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "messageId": "message-id-to-mark-as-read"
}
```

### React to Message
```
POST /api/messaging/messages/{messageId}/react
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "emoji": "👍"
}
```

### Edit Message
```
PUT /api/messaging/messages/{messageId}/edit
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "newContent": "Updated message content"
}
```

### Delete Message
```
DELETE /api/messaging/messages/{messageId}
Authorization: Bearer <your-token>
```

### Get Conversation Participants
```
GET /api/messaging/conversations/{conversationId}/participants
Authorization: Bearer <your-token>
```

### Update Conversation Settings
```
PUT /api/messaging/conversations/{conversationId}/settings
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "settings": {
    "allowFileSharing": true,
    "allowImageSharing": true,
    "maxFileSize": 10485760
  }
}
```

### Archive Conversation
```
PUT /api/messaging/conversations/{conversationId}/archive
Authorization: Bearer <your-token>
```

### Get Unread Count
```
GET /api/messaging/unread-count
Authorization: Bearer <your-token>
```

### Search Messages
```
GET /api/messaging/search?query=hello&conversationId=conversation-id&limit=20&skip=0
Authorization: Bearer <your-token>
```

---

## 👨‍💼 Admin Messaging Endpoints

### Get All Conversations (Admin)
```
GET /api/admin/messaging/conversations?limit=50&skip=0&status=active&type=direct
Authorization: Bearer <admin-token>
```

### Get Specific Conversation (Admin)
```
GET /api/admin/messaging/conversations/{conversationId}
Authorization: Bearer <admin-token>
```

### Get Flagged Messages
```
GET /api/admin/messaging/messages/flagged?limit=50&skip=0
Authorization: Bearer <admin-token>
```

### Flag Message
```
POST /api/admin/messaging/messages/{messageId}/flag
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "reason": "Inappropriate content"
}
```

### Unflag Message
```
DELETE /api/admin/messaging/messages/{messageId}/flag
Authorization: Bearer <admin-token>
```

### Add Admin Note to Message
```
POST /api/admin/messaging/messages/{messageId}/notes
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "note": "Admin note about this message"
}
```

### Add Admin Note to Conversation
```
POST /api/admin/messaging/conversations/{conversationId}/notes
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "note": "Admin note about this conversation"
}
```

### Send Admin Message
```
POST /api/admin/messaging/conversations/{conversationId}/admin-message
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "content": "This is an admin message",
  "messageType": "system"
}
```

### Block/Unblock Conversation
```
PUT /api/admin/messaging/conversations/{conversationId}/block
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "blocked": true,
  "reason": "Policy violation"
}
```

### Get Messaging Statistics
```
GET /api/admin/messaging/statistics?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <admin-token>
```

### Search Conversations (Admin)
```
GET /api/admin/messaging/search?query=john&limit=50&skip=0
Authorization: Bearer <admin-token>
```

### Delete Conversation (Admin)
```
DELETE /api/admin/messaging/conversations/{conversationId}
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "reason": "Policy violation"
}
```

---

## 🧪 Testing Endpoints

### Create Sample Conversation
```
POST /api/messaging-test/create-sample-conversation
Authorization: Bearer <your-token>
```

### Send Sample Message
```
POST /api/messaging-test/send-sample-message/{conversationId}
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "content": "Test message content"
}
```

### Get My Conversations
```
GET /api/messaging-test/my-conversations
Authorization: Bearer <your-token>
```

### Get Conversation Messages
```
GET /api/messaging-test/conversation/{conversationId}/messages?limit=50
Authorization: Bearer <your-token>
```

### Get Online Users
```
GET /api/messaging-test/online-users
Authorization: Bearer <your-token>
```

### Get Socket Status
```
GET /api/messaging-test/socket-status
Authorization: Bearer <your-token>
```

### Get All Users
```
GET /api/messaging-test/all-users
Authorization: Bearer <your-token>
```

### Simulate Typing
```
POST /api/messaging-test/simulate-typing/{conversationId}
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "isTyping": true
}
```

### Get Conversation Statistics
```
GET /api/messaging-test/conversation/{conversationId}/stats
Authorization: Bearer <your-token>
```

### Cleanup Test Data
```
DELETE /api/messaging-test/cleanup-test-data
Authorization: Bearer <your-token>
```

---

## 🔌 Socket.IO Events

### Client Events (Send to Server)

#### Connect
```javascript
const socket = io('http://localhost:3001', {
  auth: { token: 'your-jwt-token' }
});
```

#### Send Message
```javascript
socket.emit('send_message', {
  conversationId: 'conversation-id',
  content: 'Hello!',
  messageType: 'text'
});
```

#### Mark as Read
```javascript
socket.emit('mark_read', {
  conversationId: 'conversation-id',
  messageId: 'message-id'
});
```

#### React to Message
```javascript
socket.emit('react_to_message', {
  messageId: 'message-id',
  emoji: '👍'
});
```

#### Edit Message
```javascript
socket.emit('edit_message', {
  messageId: 'message-id',
  newContent: 'Updated content'
});
```

#### Delete Message
```javascript
socket.emit('delete_message', {
  messageId: 'message-id'
});
```

#### Typing Start
```javascript
socket.emit('typing_start', {
  conversationId: 'conversation-id'
});
```

#### Typing Stop
```javascript
socket.emit('typing_stop', {
  conversationId: 'conversation-id'
});
```

### Server Events (Listen from Server)

#### Connected
```javascript
socket.on('connected', (data) => {
  console.log('Connected:', data);
});
```

#### New Message
```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data.message);
});
```

#### Message Read
```javascript
socket.on('message_read', (data) => {
  console.log('Message read:', data);
});
```

#### Message Reaction
```javascript
socket.on('message_reaction', (data) => {
  console.log('Message reaction:', data);
});
```

#### Message Edited
```javascript
socket.on('message_edited', (data) => {
  console.log('Message edited:', data);
});
```

#### Message Deleted
```javascript
socket.on('message_deleted', (data) => {
  console.log('Message deleted:', data);
});
```

#### User Typing
```javascript
socket.on('user_typing', (data) => {
  console.log('User typing:', data);
});
```

#### User Status Changed
```javascript
socket.on('user_status_changed', (data) => {
  console.log('User status:', data);
});
```

#### Admin Message
```javascript
socket.on('admin_message', (data) => {
  console.log('Admin message:', data);
});
```

#### System Message
```javascript
socket.on('system_message', (data) => {
  console.log('System message:', data);
});
```

---

## 📊 Data Models

### Conversation
```json
{
  "_id": "conversation-id",
  "participants": [
    {
      "user": "user-id",
      "role": "speaker",
      "joinedAt": "2024-01-01T00:00:00.000Z",
      "lastReadAt": "2024-01-01T00:00:00.000Z",
      "isActive": true
    }
  ],
  "type": "direct",
  "context": {
    "topic": "Event Discussion"
  },
  "status": "active",
  "lastMessage": {
    "content": "Hello!",
    "sender": "user-id",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "messageType": "text"
  },
  "settings": {
    "allowFileSharing": true,
    "allowImageSharing": true,
    "maxFileSize": 10485760
  }
}
```

### Message
```json
{
  "_id": "message-id",
  "content": "Hello!",
  "messageType": "text",
  "sender": "user-id",
  "conversation": "conversation-id",
  "status": "sent",
  "attachments": [],
  "metadata": {
    "reactions": [
      {
        "user": "user-id",
        "emoji": "👍",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "editedAt": null,
    "editHistory": []
  },
  "readBy": [
    {
      "user": "user-id",
      "readAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 429 Rate Limited
```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

---

## 🔧 Rate Limiting

- **Messages**: 30 messages per minute per user
- **API Calls**: Standard rate limiting applies
- **Socket Events**: Real-time events are not rate limited

---

## 🛡️ Security Features

1. **JWT Authentication**: All endpoints require valid JWT tokens
2. **Role-based Access**: Only speakers and organizers can access messaging
3. **Admin Oversight**: Organizers can monitor all conversations
4. **Message Encryption**: Support for encrypted messages (future feature)
5. **Content Filtering**: Admin can flag inappropriate content
6. **Rate Limiting**: Prevents spam and abuse

---

## 📈 Scalability Features

1. **MongoDB Indexing**: Optimized database queries
2. **Redis Caching**: Fast message status updates
3. **Socket.IO Clustering**: Support for multiple server instances
4. **Message Pagination**: Efficient large conversation handling
5. **Auto-archiving**: Old conversations are automatically archived
6. **Cleanup Jobs**: Expired messages and old data cleanup

---

## 🧪 Testing Workflow

1. **Login** to get JWT token
2. **Create sample conversation** using test endpoint
3. **Send test messages** to verify functionality
4. **Test real-time features** using Socket.IO
5. **Test admin features** with organizer account
6. **Clean up test data** when done

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- Message content is limited to 2000 characters
- File attachments are limited to 10MB
- Conversations auto-archive after 30 days of inactivity
- Admin oversight is available for all conversations
- Real-time features require Socket.IO connection



