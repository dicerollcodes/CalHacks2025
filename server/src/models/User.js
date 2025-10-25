import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
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
  // Username for profile URLs (e.g., /user/johndoe)
  username: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-z0-9_]+$/  // Only lowercase letters, numbers, and underscores
  }
}, {
  timestamps: true
});

// Index for faster lookups (username already indexed via unique:true)
userSchema.index({ schoolId: 1 });

export default mongoose.model('User', userSchema);
