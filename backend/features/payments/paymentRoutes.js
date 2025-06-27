const express = require('express');
const router = express.Router();
const paymentController = require('./paymentController');
const { authenticate } = require('../auth/authMiddleware/combinedAuthMiddleware');

// Apply authentication middleware to all payment routes
router.use(authenticate);

// Create Razorpay order
router.post('/create-order', paymentController.createOrder);

// Verify payment
router.post('/verify', paymentController.verifyPayment);

// Get payment details for an order
router.get('/:orderId', paymentController.getPaymentDetails);

// Process refund
router.post('/refund', paymentController.refundPayment);

module.exports = router;