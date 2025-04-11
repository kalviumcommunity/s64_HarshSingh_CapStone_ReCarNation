const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const productController = require('./productController');

router.get('/', productController.getAllProducts);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);

module.exports = router;
