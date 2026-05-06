require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
// Import passport configuration with GoogleStrategy
require('./features/auth/authMiddleware/passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');

const connectDB = require('./db/database');
const authRoutes = require('./features/auth/authRoutes');
const { mongoSanitizeMiddleware, xssSanitizeMiddleware } = require('./features/middleware/sanitize');
const { apiLimiter, authLimiter, uploadLimiter } = require('./features/middleware/rateLimiter');

const app = express();

// ─── Security Headers ──────────────────────────────────────────────────────
// helmet() must be the first middleware — sets X-Frame-Options, X-XSS-Protection,
// Strict-Transport-Security, X-Content-Type-Options, etc.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow Cloudinary images
  contentSecurityPolicy: false, // Disable CSP here — frontend handles its own
}));

// ─── CORS ──────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
}));

// ─── Body Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Limit payload size to prevent DoS
app.use(cookieParser());

// ─── Sanitization (applied globally after body parsing) ────────────────────
// 1. Strip MongoDB operator keys ($, .) — NoSQL injection prevention
app.use(mongoSanitizeMiddleware);
// 2. Strip XSS/HTML from all string fields in body and query
app.use(xssSanitizeMiddleware);

// ─── Session (for Passport OAuth flow) ────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// ─── Rate Limiting ─────────────────────────────────────────────────────────
// General API limit — applies to all /api/* routes
app.use('/api/', apiLimiter);

const productRoutes = require('./features/products/productsRoutes');
const wishlistRoutes = require('./features/wishlist/wishlistRoutes');
const verificationRoutes = require('./features/auth/verificationRoutes');
const ordersRoutes = require('./features/orders/ordersRoutes');
const paymentRoutes = require('./features/payments/paymentRoutes');
const autocompleteRoutes = require('./features/autocomplete/autocompleteRoutes');

const PORT = process.env.PORT || 3001;
connectDB();

// ─── Routes ────────────────────────────────────────────────────────────────
// Auth routes get the strict authLimiter on login/signup (applied in authRoutes.js)
app.use('/api/auth', authRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/autocomplete', autocompleteRoutes);
app.use('/uploads', express.static('uploads'));

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/health', async (req, res) => {
  const { getRedisClient, isRedisReady } = require('./config/redis');
  const mongoose = require('mongoose');
  const cloudinary = require('cloudinary').v2;
  const { GoogleAuth } = require('google-auth-library');
  const Razorpay = require('razorpay');

  const checks = {};

  // ── Redis ────────────────────────────────────────────────────────────────
  try {
    const t = Date.now();
    const redis = getRedisClient();
    if (redis && isRedisReady()) {
      await redis.ping();
      checks.redis = { status: 'healthy', latency_ms: Date.now() - t };
    } else {
      checks.redis = { status: 'unhealthy', error: 'Client not ready' };
    }
  } catch (e) {
    checks.redis = { status: 'unhealthy', error: e.message };
  }

  // ── MongoDB ──────────────────────────────────────────────────────────────
  try {
    const t = Date.now();
    const state = mongoose.connection.readyState;
    // 1 = connected
    if (state === 1) {
      await mongoose.connection.db.command({ ping: 1 });
      checks.mongodb = { status: 'healthy', latency_ms: Date.now() - t };
    } else {
      const stateMap = { 0: 'disconnected', 2: 'connecting', 3: 'disconnecting' };
      checks.mongodb = { status: 'unhealthy', error: `Connection state: ${stateMap[state] || state}` };
    }
  } catch (e) {
    checks.mongodb = { status: 'unhealthy', error: e.message };
  }

  // ── Gemini ───────────────────────────────────────────────────────────────
  try {
    const t = Date.now();
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      checks.gemini = { status: 'unconfigured', error: 'GEMINI_API_KEY not set' };
    } else {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });
      // Cheapest possible call — list models via a minimal generate
      await model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'ping' }] }] });
      checks.gemini = { status: 'healthy', latency_ms: Date.now() - t, model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' };
    }
  } catch (e) {
    checks.gemini = { status: 'unhealthy', error: e.message };
  }

  // ── Groq ─────────────────────────────────────────────────────────────────
  try {
    const t = Date.now();
    if (!process.env.GROQ_API_KEY) {
      checks.groq = { status: 'unconfigured', error: 'GROQ_API_KEY not set' };
    } else {
      const axios = require('axios');
      const resp = await axios.get('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        timeout: 5000,
      });
      checks.groq = { status: resp.status === 200 ? 'healthy' : 'degraded', latency_ms: Date.now() - t, model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant' };
    }
  } catch (e) {
    checks.groq = { status: 'unhealthy', error: e.response?.data?.error?.message || e.message };
  }

  // ── Razorpay ─────────────────────────────────────────────────────────────
  try {
    const t = Date.now();
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      checks.razorpay = { status: 'unconfigured', error: 'Razorpay credentials not set' };
    } else {
      const rp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
      // Fetch zero payments as a lightweight connectivity probe
      await rp.payments.all({ count: 1 });
      checks.razorpay = { status: 'healthy', latency_ms: Date.now() - t, mode: process.env.RAZORPAY_TEST_MODE === 'true' ? 'test' : 'live' };
    }
  } catch (e) {
    checks.razorpay = { status: 'unhealthy', error: e.error?.description || e.message };
  }

  // ── Cloudinary ───────────────────────────────────────────────────────────
  try {
    const t = Date.now();
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      checks.cloudinary = { status: 'unconfigured', error: 'Cloudinary credentials not set' };
    } else {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      await cloudinary.api.ping();
      checks.cloudinary = { status: 'healthy', latency_ms: Date.now() - t, cloud: process.env.CLOUDINARY_CLOUD_NAME };
    }
  } catch (e) {
    checks.cloudinary = { status: 'unhealthy', error: e.message };
  }

  // ── Google Auth ──────────────────────────────────────────────────────────
  try {
    const t = Date.now();
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      checks.google_auth = { status: 'unconfigured', error: 'Google OAuth credentials not set' };
    } else {
      // Fetch Google's OAuth2 discovery document as a lightweight reachability probe
      const axios = require('axios');
      const resp = await axios.get('https://accounts.google.com/.well-known/openid-configuration', { timeout: 5000 });
      checks.google_auth = {
        status: resp.status === 200 ? 'healthy' : 'degraded',
        latency_ms: Date.now() - t,
        client_id_prefix: process.env.GOOGLE_CLIENT_ID.slice(0, 8) + '…',
      };
    }
  } catch (e) {
    checks.google_auth = { status: 'unhealthy', error: e.message };
  }

  // ── Overall status ───────────────────────────────────────────────────────
  const allHealthy = Object.values(checks).every((c) => c.status === 'healthy' || c.status === 'unconfigured');
  const httpStatus = allHealthy ? 200 : 207; // 207 Multi-Status when at least one service is degraded

  res.status(httpStatus).json({
    status: allHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    services: checks,
  });
});

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  // Don't leak stack traces to clients in production
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});