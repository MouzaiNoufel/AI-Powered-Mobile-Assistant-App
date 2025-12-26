const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'register',
      'ai_request',
      'ai_response',
      'ai_error',
      'conversation_created',
      'conversation_deleted',
      'settings_updated',
      'profile_updated',
      'subscription_upgraded',
      'subscription_cancelled',
      'app_opened',
      'app_backgrounded',
      'push_notification_received',
      'push_notification_opened',
      'error',
      'custom',
    ],
    index: true,
  },
  properties: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  metadata: {
    platform: {
      type: String,
      enum: ['ios', 'android', 'web'],
    },
    appVersion: String,
    deviceModel: String,
    osVersion: String,
    screenName: String,
    sessionId: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Compound indexes for common queries
analyticsEventSchema.index({ user: 1, eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ timestamp: -1 });

// TTL index to automatically delete old events (90 days)
analyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Static method to log an event
analyticsEventSchema.statics.logEvent = async function(userId, eventType, properties = {}, metadata = {}) {
  return await this.create({
    user: userId,
    eventType,
    properties,
    metadata,
    timestamp: new Date(),
  });
};

// Static method to get user activity summary
analyticsEventSchema.statics.getUserActivitySummary = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const summary = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        lastOccurrence: { $max: '$timestamp' },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  return summary;
};

// Static method to get AI usage stats
analyticsEventSchema.statics.getAiUsageStats = async function(userId, period = 'month') {
  const startDate = new Date();
  
  switch (period) {
    case 'day':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  const stats = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        eventType: { $in: ['ai_request', 'ai_response', 'ai_error'] },
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          type: '$eventType',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        },
        count: { $sum: 1 },
        totalTokens: { $sum: '$properties.tokens' },
      },
    },
    {
      $sort: { '_id.date': -1 },
    },
  ]);

  return stats;
};

// Static method for admin dashboard analytics
analyticsEventSchema.statics.getGlobalStats = async function(period = 'day') {
  const startDate = new Date();
  
  switch (period) {
    case 'day':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
  }

  const stats = await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
      },
    },
    {
      $facet: {
        eventCounts: [
          { $group: { _id: '$eventType', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        uniqueUsers: [
          { $group: { _id: '$user' } },
          { $count: 'count' },
        ],
        dailyActivity: [
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              events: { $sum: 1 },
              users: { $addToSet: '$user' },
            },
          },
          {
            $project: {
              _id: 1,
              events: 1,
              uniqueUsers: { $size: '$users' },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: 30 },
        ],
        aiUsage: [
          {
            $match: { eventType: { $in: ['ai_request', 'ai_response'] } },
          },
          {
            $group: {
              _id: null,
              totalRequests: { $sum: 1 },
              totalTokens: { $sum: '$properties.tokens' },
            },
          },
        ],
      },
    },
  ]);

  return stats[0];
};

const Analytics = mongoose.model('Analytics', analyticsEventSchema);

module.exports = Analytics;
