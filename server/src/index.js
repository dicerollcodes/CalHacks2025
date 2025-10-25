import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { connectDB } from './config/database.js';

// Import routes
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import matchRouter from './routes/match.js';
import recommendationsRouter from './routes/recommendations.js';
import messagesRouter from './routes/messages.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/match', matchRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/messages', messagesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Socket.IO connection handling
const onlineUsers = new Map(); // username -> socketId

io.on('connection', (socket) => {
  console.log('✓ Socket connected:', socket.id);

  // User joins with their username
  socket.on('user:online', (username) => {
    onlineUsers.set(username, socket.id);
    console.log(`✓ User ${username} is online (${socket.id})`);
  });

  // Send message in real-time
  socket.on('message:send', async ({ senderId, recipientId, content, messageId }) => {
    console.log(`💬 Real-time message from ${senderId} to ${recipientId}`);

    // Check if recipient is online
    const recipientSocketId = onlineUsers.get(recipientId);

    if (recipientSocketId) {
      // Send to recipient immediately
      io.to(recipientSocketId).emit('message:receive', {
        id: messageId,
        senderId,
        recipientId,
        content,
        createdAt: new Date().toISOString()
      });
      console.log(`  → Delivered to ${recipientId} instantly`);
    } else {
      console.log(`  → ${recipientId} offline, will get from DB later`);
    }

    // Also send back to sender for confirmation
    socket.emit('message:sent', { messageId });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Remove user from online users
    for (const [username, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(username);
        console.log(`✗ User ${username} is offline`);
        break;
      }
    }
  });
});

// Make io available to routes
app.set('io', io);

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start listening
    httpServer.listen(PORT, () => {
      console.log(`
🧊 Shatter the Ice API
Server running on http://localhost:${PORT}
Socket.IO enabled for real-time messaging
Environment: ${process.env.NODE_ENV || 'development'}
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
