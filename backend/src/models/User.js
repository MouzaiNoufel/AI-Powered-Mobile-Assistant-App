const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  avatar: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['user', 'premium', 'admin'],
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    language: {
      type: String,
      default: 'en',
    },
    notifications: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
    },
    aiPersonality: {
      type: String,
      enum: ['professional', 'friendly', 'concise', 'detailed'],
      default: 'friendly',
    },
  },
  usage: {
    dailyAiRequests: { type: Number, default: 0 },
    monthlyAiRequests: { type: Number, default: 0 },
    totalAiRequests: { type: Number, default: 0 },
    lastRequestDate: { type: Date, default: null },
    lastDailyReset: { type: Date, default: Date.now },
    lastMonthlyReset: { type: Date, default: Date.now },
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free',
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    isActive: { type: Boolean, default: false },
  },
  deviceTokens: [{
    token: String,
    platform: {
      type: String,
      enum: ['ios', 'android', 'web'],
    },
    createdAt: { type: Date, default: Date.now },
  }],
  refreshTokens: [{
    token: String,
    expiresAt: Date,
    createdAt: { type: Date, default: Date.now },
  }],
  lastLoginAt: {
    type: Date,
    default: null,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'usage.lastRequestDate': -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

// Method to check and reset usage limits
userSchema.methods.checkAndResetUsage = function() {
  const now = new Date();
  const lastDaily = new Date(this.usage.lastDailyReset);
  const lastMonthly = new Date(this.usage.lastMonthlyReset);

  // Reset daily usage if it's a new day
  if (now.toDateString() !== lastDaily.toDateString()) {
    this.usage.dailyAiRequests = 0;
    this.usage.lastDailyReset = now;
  }

  // Reset monthly usage if it's a new month
  if (now.getMonth() !== lastMonthly.getMonth() || now.getFullYear() !== lastMonthly.getFullYear()) {
    this.usage.monthlyAiRequests = 0;
    this.usage.lastMonthlyReset = now;
  }

  return this;
};

// Method to get usage limits based on subscription
userSchema.methods.getUsageLimits = function() {
  const config = require('../config');
  const isPremium = this.role === 'premium' || this.role === 'admin' || this.subscription.isActive;
  
  return {
    daily: isPremium ? config.aiLimits.daily.premium : config.aiLimits.daily.free,
    monthly: isPremium ? config.aiLimits.monthly.premium : config.aiLimits.monthly.free,
  };
};

// Method to check if user can make AI request
userSchema.methods.canMakeAiRequest = function() {
  this.checkAndResetUsage();
  const limits = this.getUsageLimits();
  
  return {
    canMake: this.usage.dailyAiRequests < limits.daily && this.usage.monthlyAiRequests < limits.monthly,
    dailyRemaining: Math.max(0, limits.daily - this.usage.dailyAiRequests),
    monthlyRemaining: Math.max(0, limits.monthly - this.usage.monthlyAiRequests),
    limits,
  };
};

// Method to increment usage
userSchema.methods.incrementUsage = function() {
  this.checkAndResetUsage();
  this.usage.dailyAiRequests += 1;
  this.usage.monthlyAiRequests += 1;
  this.usage.totalAiRequests += 1;
  this.usage.lastRequestDate = new Date();
  return this;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
