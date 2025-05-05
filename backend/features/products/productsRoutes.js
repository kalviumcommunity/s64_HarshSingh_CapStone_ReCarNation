const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const productController = require('./productController');
const { isAuthenticated } = require('../auth/authMiddleware/authMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes
router.post('/', isAuthenticated, upload.array('images', 10), productController.createProduct);
router.put('/:id', isAuthenticated, productController.updateProduct);
router.delete('/:id', isAuthenticated, productController.deleteProduct);

// Role-based routes
router.get('/mine', isAuthenticated, productController.getUserProducts);
router.get('/admin/all', isAuthenticated, productController.getAllProductsAdmin);

module.exports = router;
