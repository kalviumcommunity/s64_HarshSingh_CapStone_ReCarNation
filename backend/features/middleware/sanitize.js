const xss = require('xss');

/**
 * Recursively sanitizes all string values in an object against XSS.
 * Strips HTML tags and dangerous attribute values.
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return xss(obj.trim());
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }

  return obj; // Numbers, booleans, etc. pass through unchanged
};

const sanitizeObjectInPlace = (obj) => {
  if (!obj || typeof obj !== 'object') return;

  for (const key of Object.keys(obj)) {
    const value = obj[key];

    if (typeof value === 'string') {
      obj[key] = xss(value.trim());
      continue;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] === 'string') {
          value[i] = xss(value[i].trim());
        } else if (value[i] && typeof value[i] === 'object') {
          sanitizeObjectInPlace(value[i]);
        }
      }
      continue;
    }

    if (value && typeof value === 'object') {
      sanitizeObjectInPlace(value);
    }
  }
};

const stripMongoOperatorsInPlace = (obj, req) => {
  if (!obj || typeof obj !== 'object') return;

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const hasDangerousChars = key.includes('$') || key.includes('.');

    if (hasDangerousChars) {
      const safeKey = key.replace(/\$/g, '_').replace(/\./g, '_');
      delete obj[key];
      obj[safeKey] = value;
      console.warn(`[Security] Blocked NoSQL injection attempt. Key: "${key}" — IP: ${req.ip}`);
    }

    const nextKey = hasDangerousChars ? key.replace(/\$/g, '_').replace(/\./g, '_') : key;
    const nextValue = obj[nextKey];
    if (nextValue && typeof nextValue === 'object') {
      stripMongoOperatorsInPlace(nextValue, req);
    }
  }
};

/**
 * NoSQL Injection Prevention:
 * Strips keys containing '$' or '.' from
 * req.body, req.query, and req.params — blocking MongoDB operator injection.
 * e.g. { "email": { "$gt": "" } } becomes { "email": {} }
 */
const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    stripMongoOperatorsInPlace(req.body, req);
  }
  if (req.params && typeof req.params === 'object') {
    stripMongoOperatorsInPlace(req.params, req);
  }
  if (req.query && typeof req.query === 'object') {
    stripMongoOperatorsInPlace(req.query, req);
  }
  next();
};

/**
 * XSS Sanitization:
 * Strips HTML/script tags from all string fields in req.body.
 * Applied after express.json() parses the body.
 */
const xssSanitizeMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    sanitizeObjectInPlace(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    sanitizeObjectInPlace(req.query);
  }
  next();
};

module.exports = { mongoSanitizeMiddleware, xssSanitizeMiddleware };
