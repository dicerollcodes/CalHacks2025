# Messaging Feature Implementation

## Overview
Added end-to-end encrypted messaging functionality to Shatter the Ice, allowing users with 70+ match scores to communicate securely.

## Features Implemented

### 1. Backend (Node.js/Express/MongoDB)

#### New Models:
- **Message** (`server/src/models/Message.js`)
  - Stores encrypted messages between users
  - Includes both recipient and sender encrypted versions
  - Tracks read status
  
- **Match** (`server/src/models/Match.js`)
  - Tracks matches with 70+ score
  - Stores user info for quick access
  - Enables messaging permission

#### New Routes (`server/src/routes/messages.js`):
- `POST /api/messages` - Send encrypted message
- `GET /api/messages/conversations/:userId` - Get all conversations
- `GET /api/messages/:userId/:otherUserId` - Get messages between two users
- `PUT /api/messages/public-key/:userId` - Update user's public key
- `GET /api/messages/public-key/:userId` - Get user's public key

#### Updates:
- **User Model**: Added `publicKey` field for E2EE
- **Match Route**: Automatically creates Match records when score >= 70%

### 2. Frontend (React)

#### New Utilities:
- **Encryption** (`client/src/utils/encryption.js`)
  - RSA-OAEP encryption using Web Crypto API
  - Key pair generation and storage in localStorage
  - Message encryption/decryption functions
  - Supports 2048-bit RSA keys

#### New Components:
- **Messages Page** (`client/src/pages/Messages.jsx`)
  - Lists all conversations (70+ matches)
  - Real-time chat interface
  - End-to-end encrypted messaging
  - Shows match scores
  - Auto-scrolling messages
  - Unread message counts
  
#### Updates:
- **UserProfileNew**: Added conversation starters section
  - Shows 3 clickable message templates
  - Auto-fills interest-based starters
  - Only visible for 70+ matches
  - Navigates to Messages page with pre-filled text
  
- **Global Navigation**: Floating messages button on profile pages
  - Only shows when viewer is present
  - Quick access to messages from anywhere
  
- **App.jsx**: Added `/messages` route

#### API Service Updates (`client/src/services/api.js`):
- `sendMessage()` - Send encrypted message
- `getConversations()` - List conversations
- `getMessages()` - Fetch message history
- `updatePublicKey()` - Upload public key
- `getPublicKey()` - Fetch recipient's public key

### 3. Conversation Starters

Three pre-generated templates based on shared interests:
1. "Hey! I saw we have {interest} in common on Shatter the Ice! How long have you been into {interest}?"
2. "What got you interested in {interest}? I'd love to hear your story!"
3. "I'm always looking to connect with people who are into {interest}. Want to chat about it?"

### 4. Security Features

#### End-to-End Encryption:
- RSA-OAEP with SHA-256 hashing
- 2048-bit key pairs
- Keys generated and stored locally
- Server cannot decrypt messages
- Each message encrypted twice (for sender and recipient)

#### Privacy:
- Only users with 70+ match score can message
- Server verifies match status before sending/receiving
- Public keys stored on server, private keys stay local
- Messages marked as read automatically

## User Flow

1. **User A views User B's profile** with `?viewer=USER_A_ID`
2. **Match calculated** - if score >= 70%, Match record created
3. **Conversation starters appear** at bottom of profile (70+ only)
4. **User A clicks a starter** - redirected to Messages page with pre-filled text
5. **First visit to Messages** - encryption keys auto-generated
6. **Select conversation** from left sidebar
7. **Send messages** - automatically encrypted before sending
8. **User B receives** - messages decrypted on their device
9. **Floating messages button** on any profile for quick access

## Technical Details

### Encryption Flow:
```
1. Generate RSA keypair (or load from localStorage)
2. Upload public key to server
3. To send message:
   - Fetch recipient's public key
   - Encrypt message with recipient's public key
   - Encrypt message with own public key (for self)
   - Send both versions to server
4. To read message:
   - Fetch encrypted messages from server
   - Decrypt with own private key
   - Display plaintext
```

### Database Schema:

**Match:**
```javascript
{
  userIds: [String],      // Sorted array
  user1Id: String,
  user2Id: String,
  matchScore: Number,
  canMessage: Boolean,    // true if score >= 70
  user1Name: String,
  user2Name: String,
  user1Avatar: String,
  user2Avatar: String
}
```

**Message:**
```javascript
{
  senderId: String,
  recipientId: String,
  encryptedContent: String,        // For recipient
  senderEncryptedContent: String,  // For sender
  isRead: Boolean,
  createdAt: Date
}
```

## Files Created/Modified

### Created:
- `server/src/models/Message.js`
- `server/src/models/Match.js`
- `server/src/routes/messages.js`
- `client/src/utils/encryption.js`
- `client/src/pages/Messages.jsx`

### Modified:
- `server/src/models/User.js` - Added publicKey field
- `server/src/routes/match.js` - Auto-create Match records
- `server/src/index.js` - Added messages routes
- `client/src/pages/UserProfileNew.jsx` - Added conversation starters & nav
- `client/src/services/api.js` - Added messaging APIs
- `client/src/App.jsx` - Added Messages route

## Testing

1. **Start server**: `cd server && npm run dev`
2. **Start client**: `cd client && npm run dev`
3. **Create users**: Use existing seed script
4. **Test flow**:
   - Visit `/user/USER_B_ID?viewer=USER_A_ID`
   - Shatter the ice
   - If score >= 70%, conversation starters appear
   - Click a starter
   - Sends you to Messages page
   - Send encrypted message
   - Check as USER_B: `/messages?userId=USER_B_ID`

## Future Enhancements

- Real-time messaging with WebSockets
- Message notifications
- Image/file sharing
- Message search
- Block/report users
- Export/import encryption keys
- Multi-device key sync
- Message deletion
- Typing indicators
- Read receipts toggle

