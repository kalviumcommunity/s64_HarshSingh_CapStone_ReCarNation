const express = require('express');
const router = express.Router();
const authController = require('./authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/get', authController.getAllEmails);

// router.get('/profile', authController.authController.profile);

module.exports = router;
