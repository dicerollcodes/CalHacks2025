import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  // Store sorted user IDs to ensure consistency
  userIds: {
    type: [String],
    required: true,
    index: true
  },
  user1Id: {
    type: String,
    required: true,
    index: true
  },
  user2Id: {
    type: String,
    required: true,
    index: true
  },
  matchScore: {
    type: Number,
    required: true
  },
  // Track when users can message (score >= 70)
  canMessage: {
    type: Boolean,
    default: false
  },
  // Store basic user info for quick access
  user1Name: String,
  user2Name: String,
  user1Avatar: String,
  user2Avatar: String
}, {
  timestamps: true
});

// Compound unique index
matchSchema.index({ userIds: 1 }, { unique: true });
matchSchema.index({ user1Id: 1, canMessage: 1 });
matchSchema.index({ user2Id: 1, canMessage: 1 });

export default mongoose.model('Match', matchSchema);

