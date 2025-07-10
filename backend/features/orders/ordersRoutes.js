const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, updatePaymentStatus, cancelOrder, getOrderById } = require('./ordersController');
const { authenticate } = require('../auth/authMiddleware/combinedAuthMiddleware');

// Create order
router.post('/', authenticate, createOrder);
// Get all orders for logged-in user
router.get('/', authenticate, getUserOrders);
// Get specific order by ID
router.get('/:orderId', authenticate, getOrderById);
// Update payment status for an order
router.put('/:orderId/payment', authenticate, updatePaymentStatus);
// Cancel an order
router.put('/:orderId/cancel', authenticate, cancelOrder);

module.exports = router;
