const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('./authController');
const googleController = require('./middleware/googleController')
const { isAuthenticated } = require('./middleware/authMiddleware');

// JWT routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/emails', authController.getAllEmails);
router.get('/profile', isAuthenticated, authController.profile);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), googleController.googleCallback);


module.exports = router;
