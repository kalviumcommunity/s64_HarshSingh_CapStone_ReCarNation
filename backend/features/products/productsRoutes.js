const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const productController = require('./productController');
const { isAuthenticated } = require('../auth/authMiddleware/authMiddleware');

router.get('/', productController.getAllProducts);
router.post('/', isAuthenticated, productController.createProduct);
router.post('/', isAuthenticated, upload.single('image'), productController.createProduct);
router.put('/:id', isAuthenticated, productController.updateProduct);

module.exports = router;
