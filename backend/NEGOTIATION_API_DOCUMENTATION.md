# Negotiation API Documentation

## Overview
The Negotiation API provides a comprehensive system for organizers and speakers to negotiate speaking fees and terms through the messaging platform. It supports proposal creation, counter-proposals, acceptance, decline, and cancellation workflows.

## Base URL
```
http://localhost:3001/api/negotiations
```

## Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <jwt-token>
```

## Endpoints

### 1. Create Negotiation
**POST** `/conversations/:conversationId/negotiations`

Creates a new negotiation in a conversation between organizer and speaker.

**Request Body:**
```json
{
  "amount": 5000,
  "currency": "USD",
  "topic": "Speaking Engagement",
  "message": "We'd love to have you speak at our event",
  "eventId": "optional-event-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Negotiation created successfully",
  "negotiation": {
    "_id": "negotiation-id",
    "conversation": "conversation-id",
    "organizer": "organizer-id",
    "speaker": "speaker-id",
    "topic": "Speaking Engagement",
    "currentProposal": {
      "amount": 5000,
      "currency": "USD",
      "proposedBy": "organizer-id",
      "proposedAt": "2024-01-15T10:30:00Z",
      "message": "We'd love to have you speak at our event"
    },
    "status": "active"
  },
  "message": {
    "_id": "message-id",
    "content": "💰 New proposal: USD 5000 - We'd love to have you speak at our event",
    "messageType": "negotiation_proposal",
    "sender": "organizer-id",
    "conversation": "conversation-id"
  }
}
```

### 2. Get Negotiation
**GET** `/conversations/:conversationId/negotiations`

Retrieves the negotiation for a specific conversation.

**Response:**
```json
{
  "success": true,
  "message": "Negotiation retrieved successfully",
  "negotiation": {
    "_id": "negotiation-id",
    "conversation": "conversation-id",
    "organizer": {
      "_id": "organizer-id",
      "firstName": "John",
      "lastName": "Doe",
      "role": "organizer"
    },
    "speaker": {
      "_id": "speaker-id",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "speaker"
    },
    "topic": "Speaking Engagement",
    "currentProposal": {
      "amount": 5000,
      "currency": "USD",
      "proposedBy": "organizer-id",
      "proposedAt": "2024-01-15T10:30:00Z",
      "message": "We'd love to have you speak at our event"
    },
    "proposals": [...],
    "status": "active"
  }
}
```

### 3. Propose Amount (Counter-Proposal)
**POST** `/negotiations/:negotiationId/propose`

Creates a counter-proposal with a new amount.

**Request Body:**
```json
{
  "amount": 7500,
  "currency": "USD",
  "message": "I can do it for $7,500"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Proposal sent successfully",
  "negotiation": {
    "_id": "negotiation-id",
    "currentProposal": {
      "amount": 7500,
      "currency": "USD",
      "proposedBy": "speaker-id",
      "proposedAt": "2024-01-15T11:00:00Z",
      "message": "I can do it for $7,500"
    },
    "status": "active"
  },
  "message": {
    "_id": "message-id",
    "content": "💰 Counter-proposal: USD 7500 - I can do it for $7,500",
    "messageType": "negotiation_proposal"
  }
}
```

### 4. Accept Proposal
**POST** `/negotiations/:negotiationId/accept`

Accepts the current proposal.

**Request Body:**
```json
{
  "message": "Deal! Looking forward to speaking at your event."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Proposal accepted successfully",
  "negotiation": {
    "_id": "negotiation-id",
    "status": "accepted",
    "finalAgreement": {
      "amount": 7500,
      "currency": "USD",
      "acceptedAt": "2024-01-15T11:30:00Z",
      "acceptedBy": "organizer-id"
    }
  },
  "message": {
    "_id": "message-id",
    "content": "✅ Proposal accepted: USD 7500 - Deal! Looking forward to speaking at your event.",
    "messageType": "negotiation_accepted"
  }
}
```

### 5. Decline Proposal
**POST** `/negotiations/:negotiationId/decline`

Declines the current proposal.

**Request Body:**
```json
{
  "message": "Sorry, that amount doesn't work for me."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Proposal declined successfully",
  "negotiation": {
    "_id": "negotiation-id",
    "status": "active"
  },
  "message": {
    "_id": "message-id",
    "content": "❌ Proposal declined: USD 7500 - Sorry, that amount doesn't work for me.",
    "messageType": "negotiation_declined"
  }
}
```

### 6. Cancel Negotiation
**POST** `/negotiations/:negotiationId/cancel`

Cancels the entire negotiation.

**Request Body:**
```json
{
  "reason": "No longer interested in this opportunity"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Negotiation cancelled successfully",
  "negotiation": {
    "_id": "negotiation-id",
    "status": "cancelled"
  },
  "message": {
    "_id": "message-id",
    "content": "🚫 Negotiation cancelled - No longer interested in this opportunity",
    "messageType": "negotiation_cancelled"
  }
}
```

### 7. Get User Negotiations
**GET** `/negotiations`

Retrieves all negotiations for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `accepted`, `declined`, `expired`, `cancelled`)
- `limit` (optional): Number of results (default: 20)
- `skip` (optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "message": "Negotiations retrieved successfully",
  "negotiations": [
    {
      "_id": "negotiation-id",
      "topic": "Speaking Engagement",
      "status": "active",
      "currentAmount": 7500,
      "currency": "USD",
      "organizer": {...},
      "speaker": {...}
    }
  ],
  "pagination": {
    "limit": 20,
    "skip": 0,
    "total": 1
  }
}
```

### 8. Get Negotiation Statistics
**GET** `/negotiations/stats`

Retrieves negotiation statistics for the authenticated user.

**Response:**
```json
{
  "success": true,
  "message": "Negotiation statistics retrieved successfully",
  "stats": [
    {
      "_id": "active",
      "count": 3,
      "totalAmount": 22500
    },
    {
      "_id": "accepted",
      "count": 5,
      "totalAmount": 40000
    }
  ]
}
```

## Message Types

The negotiation system creates special message types in conversations:

- `negotiation_proposal`: Initial or counter-proposal
- `negotiation_accepted`: Proposal accepted
- `negotiation_declined`: Proposal declined
- `negotiation_cancelled`: Negotiation cancelled

## Real-time Events

The system emits Socket.IO events for real-time updates:

- `negotiation_created`: New negotiation created
- `negotiation_proposal`: New proposal made
- `negotiation_accepted`: Proposal accepted
- `negotiation_declined`: Proposal declined
- `negotiation_cancelled`: Negotiation cancelled

## Business Rules

1. **Proposal Limits**: Maximum 10 proposals per negotiation (configurable)
2. **Consecutive Proposals**: Users cannot make consecutive proposals
3. **Self-Response**: Users cannot accept/decline their own proposals
4. **Auto-Expiration**: Negotiations can auto-expire after 7 days (configurable)
5. **Role Validation**: Only organizers and speakers can participate
6. **Conversation Access**: Users must be participants in the conversation

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "An active negotiation already exists for this conversation"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied to this negotiation"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Negotiation not found"
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

## Complete Workflow Example

### Step 1: Organizer creates negotiation
```bash
POST /api/negotiations/conversations/conv-123/negotiations
{
  "amount": 5000,
  "currency": "USD",
  "topic": "Tech Conference 2024",
  "message": "We'd love to have you speak at our tech conference"
}
```

### Step 2: Speaker makes counter-proposal
```bash
POST /api/negotiations/negotiation-456/propose
{
  "amount": 7500,
  "currency": "USD",
  "message": "I can do it for $7,500"
}
```

### Step 3: Organizer accepts
```bash
POST /api/negotiations/negotiation-456/accept
{
  "message": "Deal! Looking forward to having you speak."
}
```

## Integration with Messaging System

The negotiation system is fully integrated with the messaging system:

1. **Conversation Creation**: Negotiations are tied to existing conversations
2. **Message Integration**: All negotiation actions create corresponding messages
3. **Real-time Updates**: Socket.IO events keep all participants updated
4. **Unread Counts**: Negotiation messages contribute to unread counts
5. **Search**: Negotiation messages are searchable through the messaging search API

## Security Features

1. **JWT Authentication**: All endpoints require valid JWT tokens
2. **Role-based Access**: Only organizers and speakers can participate
3. **Conversation Validation**: Users must be participants in the conversation
4. **Proposal Validation**: Business rules prevent invalid proposals
5. **Audit Trail**: All proposals and responses are logged with timestamps

