import mongoose from 'mongoose';

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Auto-delete expired codes after 15 minutes
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if code is still valid
verificationCodeSchema.methods.isValid = function() {
  return !this.verified && this.expiresAt > new Date() && this.attempts < 5;
};

export default mongoose.model('VerificationCode', verificationCodeSchema);
