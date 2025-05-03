const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../auth/authMiddleware/authMiddleware');
const wishlistController = require('./wishlistController');

// Protected routes
router.post('/', isAuthenticated, wishlistController.addToWishlist);
router.delete('/:productId', isAuthenticated, wishlistController.removeFromWishlist);
router.get('/', isAuthenticated, wishlistController.getWishlist);

module.exports = router; 