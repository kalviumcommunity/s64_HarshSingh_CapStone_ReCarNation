const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, updatePaymentStatus } = require('./ordersController');
const { authenticate } = require('../auth/authMiddleware/combinedAuthMiddleware');

// Create order
router.post('/', authenticate, createOrder);
// Get all orders for logged-in user
router.get('/', authenticate, getUserOrders);
// Update payment status for an order
router.put('/:orderId/payment', authenticate, updatePaymentStatus);

module.exports = router;
