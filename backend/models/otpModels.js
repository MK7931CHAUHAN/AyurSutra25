const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['password_reset', 'email_verification'],
    default: 'password_reset',
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
    max: process.env.OTP_MAX_ATTEMPTS || 3,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Create TTL index for automatic expiry
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if OTP is expired
otpSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

// Method to increment attempts
otpSchema.methods.incrementAttempts = async function () {
  this.attempts += 1;
  if (this.attempts >= (process.env.OTP_MAX_ATTEMPTS || 3)) {
    this.isUsed = true;
  }
  return this.save();
};

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;