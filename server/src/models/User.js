import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  socials: {
    instagram: { type: String, default: null },
    twitter: { type: String, default: null },
    discord: { type: String, default: null },
    linkedin: { type: String, default: null }
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  privateInterests: [{
    type: String,
    trim: true
  }],
  // For generating shareable links
  shareableId: {
    type: String,
    unique: true,
    required: true
  },
  // Public key for E2EE messaging (stored as JWK JSON string)
  publicKey: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster lookups
userSchema.index({ shareableId: 1 });
userSchema.index({ schoolId: 1 });

export default mongoose.model('User', userSchema);
