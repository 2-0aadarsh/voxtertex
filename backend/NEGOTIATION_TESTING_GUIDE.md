# Negotiation System Testing Guide

## Prerequisites

1. **Backend Server Running**: Ensure the backend is running on `http://localhost:3001`
2. **Database Connected**: MongoDB should be connected and running
3. **JWT Tokens**: You'll need valid JWT tokens for both organizer and speaker accounts
4. **Conversation Created**: A conversation between organizer and speaker should exist

## Test Data Setup

### 1. Create Test Users
First, create test accounts for organizer and speaker:

**Organizer Registration:**
```bash
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Organizer",
  "email": "organizer@test.com",
  "password": "password123",
  "role": "organizer"
}
```

**Speaker Registration:**
```bash
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Speaker",
  "email": "speaker@test.com",
  "password": "password123",
  "role": "speaker"
}
```

### 2. Login and Get JWT Tokens

**Organizer Login:**
```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "organizer@test.com",
  "password": "password123"
}
```

**Speaker Login:**
```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "speaker@test.com",
  "password": "password123"
}
```

Save the JWT tokens from both responses for use in subsequent requests.

### 3. Create Conversation

**Get All Users (to find speaker ID):**
```bash
GET http://localhost:3001/api/messaging-test/all-users
Authorization: Bearer <organizer-jwt-token>
```

**Create Conversation:**
```bash
POST http://localhost:3001/api/messaging/conversations
Authorization: Bearer <organizer-jwt-token>
Content-Type: application/json

{
  "participantId": "<speaker-user-id>",
  "type": "direct",
  "context": {
    "topic": "Speaking Opportunity"
  }
}
```

Save the `conversationId` from the response.

## Complete Negotiation Flow Testing

### Test 1: Create Initial Negotiation

**Request:**
```bash
POST http://localhost:3001/api/negotiations/conversations/<conversation-id>/negotiations
Authorization: Bearer <organizer-jwt-token>
Content-Type: application/json

{
  "amount": 5000,
  "currency": "USD",
  "topic": "Tech Conference 2024",
  "message": "We'd love to have you speak at our annual tech conference. Your expertise in AI would be perfect for our audience."
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Negotiation created successfully",
  "negotiation": {
    "_id": "negotiation-id",
    "conversation": "conversation-id",
    "organizer": "organizer-id",
    "speaker": "speaker-id",
    "topic": "Tech Conference 2024",
    "currentProposal": {
      "amount": 5000,
      "currency": "USD",
      "proposedBy": "organizer-id",
      "proposedAt": "2024-01-15T10:30:00Z",
      "message": "We'd love to have you speak at our annual tech conference..."
    },
    "status": "active"
  }
}
```

### Test 2: Speaker Makes Counter-Proposal

**Request:**
```bash
POST http://localhost:3001/api/negotiations/<negotiation-id>/propose
Authorization: Bearer <speaker-jwt-token>
Content-Type: application/json

{
  "amount": 7500,
  "currency": "USD",
  "message": "Thank you for the opportunity! I can do it for $7,500, which includes travel expenses and preparation time."
}
```

**Expected Response:**
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
      "message": "Thank you for the opportunity! I can do it for $7,500..."
    },
    "status": "active"
  }
}
```

### Test 3: Organizer Accepts Proposal

**Request:**
```bash
POST http://localhost:3001/api/negotiations/<negotiation-id>/accept
Authorization: Bearer <organizer-jwt-token>
Content-Type: application/json

{
  "message": "Perfect! $7,500 works for us. We're excited to have you speak at our conference. I'll send over the contract details shortly."
}
```

**Expected Response:**
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
  }
}
```

## Alternative Flow: Decline and Counter-Proposal

### Test 4: Speaker Declines Initial Proposal

**Request:**
```bash
POST http://localhost:3001/api/negotiations/<negotiation-id>/decline
Authorization: Bearer <speaker-jwt-token>
Content-Type: application/json

{
  "message": "I appreciate the offer, but $5,000 is below my standard rate for conferences of this size."
}
```

### Test 5: Organizer Makes New Proposal

**Request:**
```bash
POST http://localhost:3001/api/negotiations/<negotiation-id>/propose
Authorization: Bearer <organizer-jwt-token>
Content-Type: application/json

{
  "amount": 6500,
  "currency": "USD",
  "message": "I understand. How about $6,500? This includes all travel and accommodation expenses."
}
```

## Additional Test Cases

### Test 6: Get Negotiation Details

**Request:**
```bash
GET http://localhost:3001/api/negotiations/conversations/<conversation-id>/negotiations
Authorization: Bearer <organizer-jwt-token>
```

### Test 7: Get User's Negotiations

**Request:**
```bash
GET http://localhost:3001/api/negotiations?status=active&limit=10
Authorization: Bearer <organizer-jwt-token>
```

### Test 8: Get Negotiation Statistics

**Request:**
```bash
GET http://localhost:3001/api/negotiations/stats
Authorization: Bearer <organizer-jwt-token>
```

### Test 9: Cancel Negotiation

**Request:**
```bash
POST http://localhost:3001/api/negotiations/<negotiation-id>/cancel
Authorization: Bearer <organizer-jwt-token>
Content-Type: application/json

{
  "reason": "Event has been postponed indefinitely"
}
```

## Error Testing

### Test 10: Invalid Access (403)

**Request:**
```bash
POST http://localhost:3001/api/negotiations/<negotiation-id>/propose
Authorization: Bearer <invalid-jwt-token>
Content-Type: application/json

{
  "amount": 6000,
  "currency": "USD",
  "message": "This should fail"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access denied to this negotiation"
}
```

### Test 11: Consecutive Proposals (400)

**Request:**
```bash
POST http://localhost:3001/api/negotiations/<negotiation-id>/propose
Authorization: Bearer <organizer-jwt-token>
Content-Type: application/json

{
  "amount": 6000,
  "currency": "USD",
  "message": "This should fail - consecutive proposal"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "You cannot make consecutive proposals. Wait for the other party to respond."
}
```

### Test 12: Self-Acceptance (400)

**Request:**
```bash
POST http://localhost:3001/api/negotiations/<negotiation-id>/accept
Authorization: Bearer <organizer-jwt-token>
Content-Type: application/json

{
  "message": "This should fail - self acceptance"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "You cannot accept your own proposal"
}
```

## Postman Collection

Create a Postman collection with the following structure:

```
📁 Negotiation API Tests
├── 📁 Setup
│   ├── Register Organizer
│   ├── Register Speaker
│   ├── Login Organizer
│   ├── Login Speaker
│   ├── Get All Users
│   └── Create Conversation
├── 📁 Negotiation Flow
│   ├── Create Negotiation
│   ├── Counter Proposal
│   ├── Accept Proposal
│   └── Get Negotiation
├── 📁 Alternative Flow
│   ├── Decline Proposal
│   ├── New Proposal
│   └── Cancel Negotiation
├── 📁 Additional Tests
│   ├── Get User Negotiations
│   ├── Get Negotiation Stats
│   └── Get Negotiation Details
└── 📁 Error Tests
    ├── Invalid Access
    ├── Consecutive Proposals
    └── Self Acceptance
```

## Environment Variables

Set up Postman environment variables:

```
baseUrl: http://localhost:3001
organizerToken: <organizer-jwt-token>
speakerToken: <speaker-jwt-token>
conversationId: <conversation-id>
negotiationId: <negotiation-id>
organizerId: <organizer-user-id>
speakerId: <speaker-user-id>
```

## Real-time Testing

To test real-time features:

1. **Open two browser tabs** or use two different Postman instances
2. **Connect to Socket.IO** using the conversation ID
3. **Make negotiation actions** in one tab
4. **Verify real-time updates** in the other tab

**Socket.IO Connection:**
```javascript
const socket = io('http://localhost:3001');
socket.emit('join_conversation', conversationId);

socket.on('negotiation_proposal', (data) => {
  console.log('New proposal:', data);
});

socket.on('negotiation_accepted', (data) => {
  console.log('Proposal accepted:', data);
});
```

## Performance Testing

### Load Testing with Multiple Negotiations

1. **Create multiple conversations** between different organizer-speaker pairs
2. **Start negotiations simultaneously** in different conversations
3. **Monitor response times** and database performance
4. **Test concurrent proposal/acceptance** scenarios

### Database Monitoring

Monitor MongoDB for:
- **Index usage** on negotiation queries
- **Memory usage** during high negotiation volume
- **Query performance** for complex negotiation searches

## Integration Testing

### Test with Messaging System

1. **Verify negotiation messages** appear in conversation history
2. **Test unread counts** update correctly
3. **Confirm message search** includes negotiation messages
4. **Check message reactions** work on negotiation messages

### Test with User Management

1. **Verify role-based access** (only organizers and speakers)
2. **Test user deletion** doesn't break negotiations
3. **Confirm profile updates** reflect in negotiation participants

## Security Testing

### Authentication Tests

1. **Test without JWT token** (should return 401)
2. **Test with expired token** (should return 401)
3. **Test with invalid token** (should return 401)

### Authorization Tests

1. **Test cross-user access** (user A accessing user B's negotiations)
2. **Test role validation** (regular user trying to create negotiations)
3. **Test conversation access** (user not in conversation trying to create negotiation)

## Success Criteria

✅ **All negotiation flows work correctly**
✅ **Real-time updates function properly**
✅ **Error handling is comprehensive**
✅ **Performance is acceptable under load**
✅ **Security measures are effective**
✅ **Integration with messaging system works**
✅ **Database queries are optimized**

## Troubleshooting

### Common Issues

1. **"Access denied" errors**: Check JWT token and user roles
2. **"Negotiation not found"**: Verify negotiation ID and conversation access
3. **"Consecutive proposals"**: Ensure proper turn-taking in negotiations
4. **Real-time not working**: Check Socket.IO connection and event names
5. **Database errors**: Verify MongoDB connection and schema validation

### Debug Tips

1. **Check server logs** for detailed error messages
2. **Verify JWT token payload** contains correct user information
3. **Test with simple requests** before complex flows
4. **Use MongoDB Compass** to inspect database state
5. **Monitor network requests** in browser dev tools

