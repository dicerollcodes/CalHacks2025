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
  },
  // Roommate preferences
  roommatePreferences: {
    // Sleep schedule
    sleepSchedule: {
      type: String,
      enum: ['early-riser', 'night-owl', 'flexible', null],
      default: null
    },
    bedtime: {
      type: String, // Format: "22:00" or "23:30"
      default: null
    },
    wakeTime: {
      type: String, // Format: "06:00" or "07:30"
      default: null
    },
    // Gender
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'prefer-not-to-say', null],
      default: null
    },
    genderPreference: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'no-preference', null],
      default: null
    },
    // General preferences
    cleanliness: {
      type: String,
      enum: ['very-clean', 'moderately-clean', 'relaxed', null],
      default: null
    },
    socialLevel: {
      type: String,
      enum: ['very-social', 'moderately-social', 'quiet', null],
      default: null
    },
    guests: {
      type: String,
      enum: ['often', 'sometimes', 'rarely', null],
      default: null
    },
    smoking: {
      type: String,
      enum: ['smoker', 'non-smoker', 'outside-only', null],
      default: null
    },
    pets: {
      type: String,
      enum: ['has-pets', 'no-pets', 'allergic', null],
      default: null
    }
  }
}, {
  timestamps: true
});

// Index for faster lookups (username already indexed via unique:true)
userSchema.index({ schoolId: 1 });

export default mongoose.model('User', userSchema);
