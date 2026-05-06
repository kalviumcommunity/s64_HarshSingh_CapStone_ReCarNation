const { body, param, query, validationResult } = require('express-validator');

/**
 * Reusable handler — must be placed AFTER validation chains in every route.
 * Returns 400 with a structured list of errors if any validation failed.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ---------------------------------------------------------------------------
// Auth validators
// ---------------------------------------------------------------------------

const validateSignup = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .isLength({ max: 254 }).withMessage('Email must not exceed 254 characters')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .isLength({ max: 128 }).withMessage('Password must not exceed 128 characters'),
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ max: 128 }).withMessage('Invalid credentials'),
];

const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Must be a valid email address')
    .isLength({ max: 254 }).withMessage('Email must not exceed 254 characters')
    .normalizeEmail(),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters'),

  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[0-9]{7,15}$/).withMessage('Phone must be 7-15 digits, optionally prefixed with +'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Location must not exceed 200 characters'),
];

// ---------------------------------------------------------------------------
// Product validators
// ---------------------------------------------------------------------------

const ALLOWED_TRANSMISSIONS = ['automatic', 'manual', 'cvt', 'dualClutch'];
const ALLOWED_FUEL_TYPES = ['petrol', 'diesel', 'hybrid', 'electric', 'cng'];
const CURRENT_YEAR = new Date().getFullYear();

const validateCreateProduct = [
  body('make')
    .trim()
    .notEmpty().withMessage('Make is required')
    .isLength({ max: 100 }).withMessage('Make must not exceed 100 characters')
    .matches(/^[a-zA-Z0-9\s\-\.]+$/).withMessage('Make contains invalid characters'),

  body('model')
    .trim()
    .notEmpty().withMessage('Model is required')
    .isLength({ max: 100 }).withMessage('Model must not exceed 100 characters'),

  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 1900, max: CURRENT_YEAR + 1 }).withMessage(`Year must be between 1900 and ${CURRENT_YEAR + 1}`)
    .toInt(),

  body('mileage')
    .notEmpty().withMessage('Mileage is required')
    .isFloat({ min: 0, max: 10000000 }).withMessage('Mileage must be a non-negative number')
    .toFloat(),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0, max: 100000000 }).withMessage('Price must be a positive number')
    .toFloat(),

  body('transmission')
    .optional()
    .trim()
    .isIn(ALLOWED_TRANSMISSIONS).withMessage(`Transmission must be one of: ${ALLOWED_TRANSMISSIONS.join(', ')}`),

  body('fuelType')
    .optional()
    .trim()
    .isIn(ALLOWED_FUEL_TYPES).withMessage(`Fuel type must be one of: ${ALLOWED_FUEL_TYPES.join(', ')}`),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),

  body('location')
    .trim()
    .notEmpty().withMessage('Location is required')
    .isLength({ max: 200 }).withMessage('Location must not exceed 200 characters'),

  body('contactNumber')
    .trim()
    .notEmpty().withMessage('Contact number is required')
    .matches(/^\+?[0-9]{7,15}$/).withMessage('Contact number must be 7-15 digits'),

  body('trim')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Trim must not exceed 100 characters'),
];

const validateUpdateProduct = [
  param('id')
    .isMongoId().withMessage('Invalid product ID'),

  body('make')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Make must not exceed 100 characters')
    .matches(/^[a-zA-Z0-9\s\-\.]+$/).withMessage('Make contains invalid characters'),

  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Model must not exceed 100 characters'),

  body('year')
    .optional()
    .isInt({ min: 1900, max: CURRENT_YEAR + 1 }).withMessage(`Year must be between 1900 and ${CURRENT_YEAR + 1}`)
    .toInt(),

  body('mileage')
    .optional()
    .isFloat({ min: 0, max: 10000000 }).withMessage('Mileage must be a non-negative number')
    .toFloat(),

  body('price')
    .optional()
    .isFloat({ min: 0, max: 100000000 }).withMessage('Price must be a positive number')
    .toFloat(),

  body('transmission')
    .optional()
    .trim()
    .isIn(ALLOWED_TRANSMISSIONS).withMessage(`Transmission must be one of: ${ALLOWED_TRANSMISSIONS.join(', ')}`),

  body('fuelType')
    .optional()
    .trim()
    .isIn(ALLOWED_FUEL_TYPES).withMessage(`Fuel type must be one of: ${ALLOWED_FUEL_TYPES.join(', ')}`),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description must not exceed 5000 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Location must not exceed 200 characters'),

  body('contactNumber')
    .optional()
    .trim()
    .matches(/^\+?[0-9]{7,15}$/).withMessage('Contact number must be 7-15 digits'),
];

// ---------------------------------------------------------------------------
// MongoDB ObjectId param validator (reusable)
// ---------------------------------------------------------------------------

const validateMongoId = (paramName = 'id') => [
  param(paramName)
    .isMongoId().withMessage(`Invalid ${paramName} — must be a valid MongoDB ObjectId`),
];

module.exports = {
  handleValidationErrors,
  validateSignup,
  validateLogin,
  validateUpdateProfile,
  validateCreateProduct,
  validateUpdateProduct,
  validateMongoId,
};
