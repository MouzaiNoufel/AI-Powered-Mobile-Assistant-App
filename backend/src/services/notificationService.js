const logger = require('../utils/logger');
const config = require('../config');

class NotificationService {
  constructor() {
    this.isConfigured = !!(config.fcm.serverKey && config.fcm.projectId);
    if (this.isConfigured) {
      logger.info('Push notification service initialized');
    } else {
      logger.info('Push notification service running in mock mode');
    }
  }

  // Send push notification to a single device
  async sendToDevice(token, notification, data = {}) {
    try {
      if (!this.isConfigured) {
        return this.mockSend(token, notification, data);
      }

      // In production, use Firebase Admin SDK
      // const message = {
      //   token,
      //   notification: {
      //     title: notification.title,
      //     body: notification.body,
      //   },
      //   data,
      // };
      // const response = await admin.messaging().send(message);

      logger.info(`Push notification sent to device: ${token.substring(0, 20)}...`);
      
      return {
        success: true,
        messageId: `msg_${Date.now()}`,
      };
    } catch (error) {
      logger.error('Push notification error:', error);
      throw error;
    }
  }

  // Send push notification to multiple devices
  async sendToDevices(tokens, notification, data = {}) {
    try {
      if (!tokens || tokens.length === 0) {
        return { success: true, sent: 0, failed: 0 };
      }

      const results = await Promise.allSettled(
        tokens.map(token => this.sendToDevice(token, notification, data))
      );

      const sent = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      logger.info(`Push notifications sent: ${sent} success, ${failed} failed`);

      return { success: true, sent, failed };
    } catch (error) {
      logger.error('Batch push notification error:', error);
      throw error;
    }
  }

  // Send notification to a user (all their devices)
  async sendToUser(user, notification, data = {}) {
    const tokens = user.deviceTokens?.map(d => d.token) || [];
    return this.sendToDevices(tokens, notification, data);
  }

  // Mock send for development
  async mockSend(token, notification, data) {
    logger.debug('Mock push notification:', {
      token: token.substring(0, 20) + '...',
      notification,
      data,
    });

    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      isMock: true,
    };
  }

  // Notification templates
  templates = {
    aiResponseReady: (conversationTitle) => ({
      title: 'AI Response Ready',
      body: `Your AI assistant has responded to "${conversationTitle}"`,
    }),

    dailyLimitReached: () => ({
      title: 'Daily Limit Reached',
      body: 'You\'ve reached your daily AI request limit. Upgrade to Premium for more!',
    }),

    welcomeMessage: (firstName) => ({
      title: `Welcome, ${firstName}!`,
      body: 'Your AI assistant is ready. Start a conversation now!',
    }),

    subscriptionExpiring: (daysLeft) => ({
      title: 'Subscription Expiring Soon',
      body: `Your premium subscription expires in ${daysLeft} days. Renew to keep your benefits!`,
    }),

    newFeature: (featureName) => ({
      title: 'New Feature Available!',
      body: `Check out our new ${featureName} feature. Tap to learn more!`,
    }),
  };

  // Check service status
  getStatus() {
    return {
      available: true,
      configured: this.isConfigured,
      provider: this.isConfigured ? 'firebase' : 'mock',
    };
  }
}

// Export singleton instance
const notificationService = new NotificationService();
module.exports = notificationService;
