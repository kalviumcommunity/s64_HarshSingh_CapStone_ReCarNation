const express = require('express');
const router = express.Router();
const { firebaseAuth } = require('./authMiddleware/firebaseMiddleware');
const { 
  verifyUser,
  startPhoneVerification, 
  startEmailVerification, 
  checkVerificationStatus 
} = require('./verificationController');

// Protected routes - require authentication
router.use(firebaseAuth);

// Verification routes
router.post('/verify', verifyUser);
router.post('/verify/phone', startPhoneVerification);
router.post('/verify/email', startEmailVerification);
router.get('/verify/status', checkVerificationStatus);

module.exports = router;
