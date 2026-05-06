const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');
const productController = require('./productController');
const { isAuthenticated } = require('../auth/authMiddleware/authMiddleware');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateMongoId,
  handleValidationErrors,
} = require('../middleware/validate');

// ─── Public Routes ──────────────────────────────────────────────────────────
router.get('/metadata', productController.getProductsMetadata);
router.get('/', productController.getAllProducts);

// ─── Protected Routes ───────────────────────────────────────────────────────
// Specific named routes must come BEFORE parameter routes
router.get('/mine', isAuthenticated, productController.getUserProducts);
router.get('/admin/all', isAuthenticated, productController.getAllProductsAdmin);

// ─── Image Management Routes ────────────────────────────────────────────────
router.post(
  '/:id/images',
  isAuthenticated,
  uploadLimiter,
  upload.array('images', 10),
  validateMongoId('id'),
  handleValidationErrors,
  productController.addImages
);
router.delete(
  '/:id/images/:imageId',
  isAuthenticated,
  validateMongoId('id'),
  handleValidationErrors,
  productController.removeImage
);

// ─── CRUD Routes ─────────────────────────────────────────────────────────────
router.get('/:id', validateMongoId('id'), handleValidationErrors, productController.getProductById);

router.post(
  '/',
  isAuthenticated,
  uploadLimiter,
  upload.array('images', 10),
  validateCreateProduct,
  handleValidationErrors,
  productController.createProduct
);

router.put(
  '/:id',
  isAuthenticated,
  validateUpdateProduct,
  handleValidationErrors,
  productController.updateProduct
);

router.delete(
  '/:id',
  isAuthenticated,
  validateMongoId('id'),
  handleValidationErrors,
  productController.deleteProduct
);

module.exports = router;
