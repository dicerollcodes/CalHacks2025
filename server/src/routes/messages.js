import express from 'express';
import Message from '../models/Message.js';
import Match from '../models/Match.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * POST /api/messages
 * Send a message (encrypted)
 * Body: { senderId, recipientId, encryptedContent, senderEncryptedContent }
 */
router.post('/', async (req, res) => {
  try {
    const { senderId, recipientId, encryptedContent, senderEncryptedContent } = req.body;

    if (!senderId || !recipientId || !encryptedContent || !senderEncryptedContent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify that users are matched and can message (score >= 70)
    const sortedIds = [senderId, recipientId].sort();
    const match = await Match.findOne({ 
      userIds: sortedIds,
      canMessage: true 
    });

    if (!match) {
      return res.status(403).json({ 
        error: 'You need a match score of 70+ to send messages' 
      });
    }

    // Create message
    const message = new Message({
      senderId,
      recipientId,
      encryptedContent,
      senderEncryptedContent
    });

    await message.save();

    res.json({
      success: true,
      message: {
        id: message._id,
        senderId: message.senderId,
        recipientId: message.recipientId,
        encryptedContent: message.encryptedContent,
        senderEncryptedContent: message.senderEncryptedContent,
        createdAt: message.createdAt
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/messages/conversations/:userId
 * Get all conversations (matches the user can message)
 */
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all matches where user can message
    const matches = await Match.find({
      $or: [
        { user1Id: userId },
        { user2Id: userId }
      ],
      canMessage: true
    }).sort({ updatedAt: -1 });

    // For each match, get the other user and last message
    const conversations = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
        const otherUserName = match.user1Id === userId ? match.user2Name : match.user1Name;
        const otherUserAvatar = match.user1Id === userId ? match.user2Avatar : match.user1Avatar;

        // Get last message in conversation
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: userId, recipientId: otherUserId },
            { senderId: otherUserId, recipientId: userId }
          ]
        }).sort({ createdAt: -1 });

        // Count unread messages
        const unreadCount = await Message.countDocuments({
          senderId: otherUserId,
          recipientId: userId,
          isRead: false
        });

        return {
          matchId: match._id,
          userId: otherUserId,
          userName: otherUserName,
          userAvatar: otherUserAvatar,
          matchScore: match.matchScore,
          lastMessage: lastMessage ? {
            id: lastMessage._id,
            senderId: lastMessage.senderId,
            // Return appropriate encrypted version
            encryptedContent: lastMessage.senderId === userId 
              ? lastMessage.senderEncryptedContent 
              : lastMessage.encryptedContent,
            createdAt: lastMessage.createdAt
          } : null,
          unreadCount,
          updatedAt: match.updatedAt
        };
      })
    );

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/messages/:userId/:otherUserId
 * Get messages between two users
 */
router.get('/:userId/:otherUserId', async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before; // For pagination

    // Verify users are matched
    const sortedIds = [userId, otherUserId].sort();
    const match = await Match.findOne({ 
      userIds: sortedIds,
      canMessage: true 
    });

    if (!match) {
      return res.status(403).json({ 
        error: 'You need a match score of 70+ to view messages' 
      });
    }

    // Build query
    const query = {
      $or: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId }
      ]
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Fetch messages
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    // Mark messages as read
    await Message.updateMany(
      {
        senderId: otherUserId,
        recipientId: userId,
        isRead: false
      },
      { isRead: true }
    );

    // Return messages with appropriate encrypted content
    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      // Return the version encrypted for this user
      encryptedContent: msg.senderId === userId 
        ? msg.senderEncryptedContent 
        : msg.encryptedContent,
      createdAt: msg.createdAt,
      isRead: msg.isRead
    }));

    res.json({
      success: true,
      messages: formattedMessages.reverse() // Oldest first
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/messages/public-key/:userId
 * Update user's public key
 */
router.put('/public-key/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({ error: 'Public key is required' });
    }

    const user = await User.findOne({ shareableId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.publicKey = publicKey;
    await user.save();

    res.json({
      success: true,
      message: 'Public key updated'
    });
  } catch (error) {
    console.error('Error updating public key:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/messages/public-key/:userId
 * Get user's public key for encryption
 */
router.get('/public-key/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ shareableId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      publicKey: user.publicKey
    });
  } catch (error) {
    console.error('Error fetching public key:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

