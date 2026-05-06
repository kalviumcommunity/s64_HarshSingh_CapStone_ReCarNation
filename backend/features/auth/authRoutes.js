const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('./authController');
const googleController = require('./authMiddleware/googleController');
const { isAuthenticated } = require('./authMiddleware/authMiddleware');
const { authenticate } = require('./authMiddleware/combinedAuthMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { authLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const {
  validateSignup,
  validateLogin,
  validateUpdateProfile,
  handleValidationErrors,
} = require('../middleware/validate');

// ─── JWT Routes ─────────────────────────────────────────────────────────────

// Signup — strict rate limit + input validation
router.post('/signup', authLimiter, validateSignup, handleValidationErrors, authController.signup);

// Login — strict rate limit + input validation
router.post('/login', authLimiter, validateLogin, handleValidationErrors, authController.login);

// Logout
router.post('/logout', authController.logout);

// Current user
router.get('/me', authenticate, authController.getCurrentUser);

// Admin: get all user emails
router.get('/emails', authController.getAllEmails);

// Profile read + update
router.get('/profile', authenticate, authController.profile);
router.put('/profile', authenticate, validateUpdateProfile, handleValidationErrors, authController.updateProfile);

// Role update
router.put('/role', authenticate, authController.updateRole);

// Profile image upload — upload rate limit
router.post('/profile/image', authenticate, uploadLimiter, upload.single('image'), authController.updateProfileImage);

// ─── Google OAuth ───────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), googleController.googleCallback);

// ─── Dev/Debug ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes are working!' });
  });
}

module.exports = router;
