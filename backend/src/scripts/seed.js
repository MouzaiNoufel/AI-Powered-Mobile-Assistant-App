const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const config = require('../config');
const { User } = require('../models');
const logger = require('../utils/logger');

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    logger.info('Connected to database for seeding');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: config.admin.email });
    
    if (existingAdmin) {
      logger.info('Admin user already exists, skipping seed');
    } else {
      // Create admin user
      const adminUser = await User.create({
        email: config.admin.email,
        password: config.admin.password,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isEmailVerified: true,
        subscription: {
          plan: 'enterprise',
          isActive: true,
          startDate: new Date(),
        },
      });

      logger.info(`Admin user created: ${adminUser.email}`);
    }

    // Create a demo user for testing
    const demoEmail = 'demo@aiassistant.com';
    const existingDemo = await User.findOne({ email: demoEmail });

    if (!existingDemo) {
      const demoUser = await User.create({
        email: demoEmail,
        password: 'DemoPassword123!',
        firstName: 'Demo',
        lastName: 'User',
        role: 'user',
        isEmailVerified: true,
        preferences: {
          theme: 'dark',
          aiPersonality: 'friendly',
        },
      });

      logger.info(`Demo user created: ${demoUser.email}`);
    }

    logger.info('Database seeding completed');
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
