const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { 
  protect, 
  verifyRefreshToken,
  authLimiter,
  validators 
} = require('../middleware');

// Public routes
router.post(
  '/register',
  authLimiter,
  validators.registerValidation,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validators.loginValidation,
  authController.login
);

router.post(
  '/refresh-token',
  verifyRefreshToken,
  authController.refreshToken
);

// Protected routes
router.use(protect);

router.post('/logout', authController.logout);

router.get('/me', authController.getMe);

router.patch(
  '/profile',
  validators.profileUpdateValidation,
  authController.updateProfile
);

router.patch(
  '/change-password',
  validators.passwordChangeValidation,
  authController.changePassword
);

router.post(
  '/device-token',
  validators.deviceTokenValidation,
  authController.registerDeviceToken
);

router.delete('/device-token', authController.removeDeviceToken);

router.delete('/account', authController.deleteAccount);

module.exports = router;
