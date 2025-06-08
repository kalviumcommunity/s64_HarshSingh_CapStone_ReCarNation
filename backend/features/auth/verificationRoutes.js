const express = require('express');
const router = express.Router();
const { authenticate } = require('./authMiddleware/combinedAuthMiddleware');
const { 
  verifyUser,
  startEmailVerification,
  checkVerificationStatus,
  getCurrentUser
} = require('./verificationController');

// Protected routes - require authentication
router.use(authenticate);

// User info route
router.get('/me', getCurrentUser);

// Verification routes
router.post('/verify', verifyUser);
router.post('/verify/email', startEmailVerification);
router.get('/verify/status', checkVerificationStatus);

// Expose an endpoint to check auth status
router.get('/check', (req, res) => {
  res.json({ 
    authenticated: true,
    user: req.user 
  });
});

module.exports = router;
