const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('./authController');
const googleController = require('./authMiddleware/googleController')
const { isAuthenticated } = require('./authMiddleware/authMiddleware');
const { authenticate } = require('./authMiddleware/combinedAuthMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// JWT routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getCurrentUser);
router.get('/emails', authController.getAllEmails);
router.get('/profile', authenticate, authController.profile);
router.put('/profile', authenticate, authController.updateProfile);

// Test route for debugging
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

console.log('Auth routes loaded - PUT /profile route registered');
router.post('/logout', authController.logout);
router.put('/role', authenticate, authController.updateRole);
router.post('/profile/image', authenticate, upload.single('image'), authController.updateProfileImage);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), googleController.googleCallback);

module.exports = router;
