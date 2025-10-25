import mongoose from 'mongoose';

// Define relatedInterest subdocument schema explicitly
const relatedInterestSchema = new mongoose.Schema({
  userInterest: { type: String, required: true },
  targetInterest: { type: String, required: true },
  relationship: { type: String, required: true }
}, { _id: false });

const matchCacheSchema = new mongoose.Schema({
  // Store sorted user IDs to ensure consistency (user1-user2 = user2-user1)
  userIds: {
    type: [String],
    required: true,
    index: true
  },
  // Normalized interests for matching (lowercase, trimmed)
  normalizedInterests: {
    user1: [String],
    user2: [String]
  },
  // Match results
  matchScore: {
    type: Number,
    required: true
  },
  sharedInterests: [String],
  relatedInterests: [relatedInterestSchema],
  conversationStarters: [String],
  // Track usage
  hitCount: {
    type: Number,
    default: 1
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for fast lookups
matchCacheSchema.index({ userIds: 1 }, { unique: true });

// Update lastAccessedAt and increment hitCount on retrieval
matchCacheSchema.methods.recordHit = function() {
  this.hitCount += 1;
  this.lastAccessedAt = new Date();
  return this.save();
};

export default mongoose.model('MatchCache', matchCacheSchema);
