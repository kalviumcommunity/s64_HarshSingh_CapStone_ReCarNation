const express = require('express');
const router = express.Router();
const authController = require('./authController');
const { isAuthenticated } = require('./middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/get', authController.getAllEmails);
router.get('/profile', isAuthenticated, authController.authController.profile);

module.exports = router;
