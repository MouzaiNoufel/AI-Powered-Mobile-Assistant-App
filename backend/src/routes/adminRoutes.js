const express = require('express');
const router = express.Router();
const { adminController } = require('../controllers');
const { protect, restrictTo } = require('../middleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// System Health
router.get('/health', adminController.getSystemHealth);

// Users Management
router.get('/users', adminController.getUsers);
router.get('/users/:userId', adminController.getUser);
router.patch('/users/:userId', adminController.updateUser);
router.post('/users/:userId/reset-usage', adminController.resetUserUsage);

// Activity
router.get('/activity', adminController.getRecentActivity);

// Analytics Export
router.get('/analytics/export', adminController.exportAnalytics);

module.exports = router;
