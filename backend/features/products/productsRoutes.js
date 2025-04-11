const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const productController = require('./productController');
const { isAuthenticated } = require('../auth/middleware/authMiddleware');

router.get('/', productController.getAllProducts);
router.post('/', isAuthenticated, productController.createProduct);
router.put('/:id', isAuthenticated, productController.updateProduct);

module.exports = router;
