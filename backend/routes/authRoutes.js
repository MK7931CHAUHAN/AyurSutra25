
// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Your auth middleware

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.get('/verify-reset-token/:token', authController.verifyResetToken);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getMe);
router.post('/change-password', protect, authController.changePassword);
router.post('/logout', protect, authController.logout);

module.exports = router;