const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { getRedisClient, isRedisReady } = require('../../config/redis');

/**
 * Builds a rate limiter with an optional Redis store.
 * Falls back to in-memory store gracefully if Redis is unavailable.
 */
const buildLimiter = ({ windowMs, max, message, skipSuccessfulRequests = false }) => {
  const redis = getRedisClient();

  const options = {
    windowMs,
    max,
    standardHeaders: true,   // Return RateLimit-* headers
    legacyHeaders: false,     // Disable X-RateLimit-* headers
    message: { error: message },
    skipSuccessfulRequests,
  };

  if (redis && isRedisReady()) {
    options.store = new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix: 'rl:',
    });
  }

  return rateLimit(options);
};

/**
 * Auth limiter — strict limit for login and signup to prevent brute-force attacks.
 * 50 attempts per 15 minutes per IP.
 */
const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
  skipSuccessfulRequests: true, // Don't count successful logins against the limit
});

/**
 * General API limiter — applied to all /api/* routes.
 * 200 requests per minute per IP.
 */
const apiLimiter = buildLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  message: 'Too many requests. Please slow down and try again in a minute.',
});

/**
 * Upload limiter — prevents abuse of image upload endpoints.
 * 20 uploads per hour per IP.
 */
const uploadLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Upload limit reached. You can upload at most 20 images per hour.',
});

module.exports = { authLimiter, apiLimiter, uploadLimiter };
