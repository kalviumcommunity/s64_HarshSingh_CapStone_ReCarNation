const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const productController = require('./productController');

router.post('/', productController.createProduct);
router.get('/', productController.getAllProduct);
router.put('/:id', productController.updateProduct);

module.exports = router;
