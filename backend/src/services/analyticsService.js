const { Analytics } = require('../models');
const logger = require('../utils/logger');
const config = require('../config');

class AnalyticsService {
  constructor() {
    this.enabled = config.analytics.enabled;
    if (this.enabled) {
      logger.info('Analytics service initialized');
    } else {
      logger.info('Analytics service disabled');
    }
  }

  // Track an event
  async track(userId, eventType, properties = {}, metadata = {}) {
    try {
      if (!this.enabled) {
        logger.debug('Analytics disabled, skipping event:', eventType);
        return null;
      }

      const event = await Analytics.logEvent(userId, eventType, properties, metadata);
      logger.debug(`Analytics event tracked: ${eventType}`);
      return event;
    } catch (error) {
      logger.error('Analytics tracking error:', error);
      // Don't throw - analytics failures shouldn't break the app
      return null;
    }
  }

  // Track user login
  async trackLogin(userId, metadata = {}) {
    return this.track(userId, 'login', {}, metadata);
  }

  // Track user logout
  async trackLogout(userId, metadata = {}) {
    return this.track(userId, 'logout', {}, metadata);
  }

  // Track user registration
  async trackRegistration(userId, metadata = {}) {
    return this.track(userId, 'register', {}, metadata);
  }

  // Track AI request
  async trackAiRequest(userId, properties = {}, metadata = {}) {
    return this.track(userId, 'ai_request', properties, metadata);
  }

  // Track AI response
  async trackAiResponse(userId, properties = {}, metadata = {}) {
    return this.track(userId, 'ai_response', properties, metadata);
  }

  // Track AI error
  async trackAiError(userId, error, metadata = {}) {
    return this.track(userId, 'ai_error', { 
      error: error.message,
      stack: error.stack,
    }, metadata);
  }

  // Track conversation created
  async trackConversationCreated(userId, conversationId, metadata = {}) {
    return this.track(userId, 'conversation_created', { conversationId }, metadata);
  }

  // Track settings update
  async trackSettingsUpdate(userId, changes = {}, metadata = {}) {
    return this.track(userId, 'settings_updated', { changes }, metadata);
  }

  // Track error
  async trackError(userId, error, context = {}, metadata = {}) {
    return this.track(userId, 'error', {
      message: error.message,
      stack: error.stack,
      context,
    }, metadata);
  }

  // Get user activity summary
  async getUserActivity(userId, days = 30) {
    try {
      return await Analytics.getUserActivitySummary(userId, days);
    } catch (error) {
      logger.error('Get user activity error:', error);
      return [];
    }
  }

  // Get AI usage statistics
  async getAiUsageStats(userId, period = 'month') {
    try {
      return await Analytics.getAiUsageStats(userId, period);
    } catch (error) {
      logger.error('Get AI usage stats error:', error);
      return [];
    }
  }

  // Get global statistics (admin)
  async getGlobalStats(period = 'day') {
    try {
      return await Analytics.getGlobalStats(period);
    } catch (error) {
      logger.error('Get global stats error:', error);
      return null;
    }
  }

  // Get dashboard data
  async getDashboardData() {
    try {
      const [daily, weekly, monthly] = await Promise.all([
        this.getGlobalStats('day'),
        this.getGlobalStats('week'),
        this.getGlobalStats('month'),
      ]);

      return {
        daily,
        weekly,
        monthly,
        generatedAt: new Date(),
      };
    } catch (error) {
      logger.error('Get dashboard data error:', error);
      return null;
    }
  }

  // Check service status
  getStatus() {
    return {
      enabled: this.enabled,
    };
  }
}

// Export singleton instance
const analyticsService = new AnalyticsService();
module.exports = analyticsService;
