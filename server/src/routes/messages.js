import express from 'express';
import Message from '../models/Message.js';
import Match from '../models/Match.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * POST /api/messages
 * Send a message
 * Body: { senderId, recipientId, content }
 */
router.post('/', async (req, res) => {
  try {
    const { senderId, recipientId, content } = req.body;

    if (!senderId || !recipientId || !content) {
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
      content
    });

    await message.save();

    res.json({
      success: true,
      message: {
        id: message._id,
        senderId: message.senderId,
        recipientId: message.recipientId,
        content: message.content,
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

        // Fetch live user data to get current avatar and name
        const otherUser = await User.findOne({ username: otherUserId });

        if (!otherUser) {
          return null; // Skip if user no longer exists
        }

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
          userName: otherUser.name,
          userAvatar: otherUser.avatar,
          matchScore: match.matchScore,
          canMessage: match.canMessage,
          lastMessage: lastMessage ? {
            id: lastMessage._id,
            senderId: lastMessage.senderId,
            content: lastMessage.content,
            createdAt: lastMessage.createdAt
          } : null,
          unreadCount,
          updatedAt: match.updatedAt
        };
      })
    );

    // Filter out null entries (deleted users)
    const validConversations = conversations.filter(conv => conv !== null);

    res.json({
      success: true,
      conversations: validConversations
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

    // Return messages with content
    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      content: msg.content,
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

export default router;

