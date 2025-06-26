const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders } = require('./ordersController');
const { ensureAuthenticated } = require('../auth/authMiddleware/combinedAuthMiddleware');

// Create order
router.post('/', ensureAuthenticated, createOrder);
// Get all orders for logged-in user
router.get('/', ensureAuthenticated, getUserOrders);

module.exports = router;
