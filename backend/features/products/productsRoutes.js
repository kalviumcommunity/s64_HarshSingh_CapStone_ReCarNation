const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const productController = require('./productController');
const { isAuthenticated } = require('../auth/authMiddleware/authMiddleware');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', isAuthenticated, upload.array('images', 10), productController.createProduct);
router.put('/:id', isAuthenticated, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
