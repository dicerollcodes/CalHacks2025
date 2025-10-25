import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
    index: true
  },
  recipientId: {
    type: String,
    required: true,
    index: true
  },
  // Message content in plaintext
  content: {
    type: String,
    required: true
  },
  // Flag for read status
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for efficient conversation queries
messageSchema.index({ senderId: 1, recipientId: 1 });
messageSchema.index({ recipientId: 1, senderId: 1 });
messageSchema.index({ createdAt: -1 });

export default mongoose.model('Message', messageSchema);

