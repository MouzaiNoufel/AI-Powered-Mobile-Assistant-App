const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const aiRoutes = require('./aiRoutes');
const adminRoutes = require('./adminRoutes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API version prefix
router.use('/auth', authRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
