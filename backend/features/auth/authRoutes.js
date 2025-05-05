const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('./authController');
const googleController = require('./authMiddleware/googleController')
const { isAuthenticated } = require('./authMiddleware/authMiddleware');

// JWT routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', isAuthenticated, authController.getCurrentUser);
router.get('/emails', authController.getAllEmails);
router.get('/profile', isAuthenticated, authController.profile);
router.post('/logout', authController.logout);
router.put('/role', isAuthenticated, authController.updateRole);  // New route for role update

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), googleController.googleCallback);

module.exports = router;
