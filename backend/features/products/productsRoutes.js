const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const productController = require('./productController');
const { isAuthenticated } = require('../auth/authMiddleware/authMiddleware');


router.get('/', productController.getAllProducts);
router.post('/', isAuthenticated, upload.array('images', 10), productController.createProduct);

module.exports = router;
