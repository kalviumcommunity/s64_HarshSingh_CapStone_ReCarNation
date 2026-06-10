require('dotenv').config();
const cluster = require('cluster');
const os = require('os');

const isProduction = process.env.NODE_ENV === 'production';
const enableCluster = process.env.CLUSTER_MODE === 'true' || (isProduction && process.env.CLUSTER_MODE !== 'false');

if (enableCluster && cluster.isPrimary) {
  const numCPUs = process.env.CLUSTER_WORKERS ? parseInt(process.env.CLUSTER_WORKERS, 10) : (os.availableParallelism ? os.availableParallelism() : os.cpus().length);
  console.log(`[Primary ${process.pid}] Master cluster process running on ${process.env.NODE_ENV || 'development'} environment.`);
  console.log(`[Primary ${process.pid}] Forking ${numCPUs} worker processes...`);

  // Active workers map to track heartbeats
  const workers = new Map();

  // Helper to spawn a worker and setup events
  const spawnWorker = () => {
    const worker = cluster.fork();
    workers.set(worker.id, {
      worker,
      pid: worker.process.pid,
      spawnTime: Date.now(),
      lastActive: Date.now(),
      missedPings: 0,
      isReady: false
    });

    worker.on('message', (msg) => {
      if (msg) {
        if (msg.type === 'ready') {
          const workerInfo = workers.get(worker.id);
          if (workerInfo) {
            console.log(`[Primary] Worker ${workerInfo.pid} completed startup and is ready.`);
            workerInfo.isReady = true;
            workerInfo.lastActive = Date.now();
            workerInfo.missedPings = 0;
          }
        } else if (msg.type === 'pong') {
          const workerInfo = workers.get(worker.id);
          if (workerInfo) {
            console.log(`[Primary] Received pong from worker ${workerInfo.pid}. Resetting missed pings.`);
            workerInfo.lastActive = Date.now();
            workerInfo.missedPings = 0;

            if (msg.memory && (msg.memory / 1024 / 1024) > 250) {
              console.warn(`[Primary] Worker ${workerInfo.pid} exceeded memory limit (${Math.round(msg.memory / 1024 / 1024)}MB). Recycling...`);
              workers.delete(worker.id);
              worker.kill('SIGTERM'); // Graceful
              spawnWorker();
            }
          }
        }
      }
    });

    return worker;
  };

  // Fork initial workers
  for (let i = 0; i < numCPUs; i++) {
    spawnWorker();
  }

  // Handle worker exits and restart them
  cluster.on('exit', (worker, code, signal) => {
    console.warn(`[Primary] Worker process ${worker.process.pid} (ID: ${worker.id}) exited (code: ${code}, signal: ${signal}).`);
    workers.delete(worker.id);

    if (!worker.exitedAfterDisconnect) {
      console.log('[Primary] Spawning replacement worker in 2 seconds...');
      setTimeout(() => {
        spawnWorker();
      }, 2000);
    }
  });

  // Event loop deadlock detection (Heartbeat mechanism)
  // Sends a ping every 10 seconds. If a worker fails to respond to 3 consecutive pings, it is considered deadlocked/frozen and is forcefully killed.
  const HEARTBEAT_INTERVAL = 10000; // 10s
  const MAX_MISSED_PINGS = 3;

  const heartbeatTimer = setInterval(() => {
    workers.forEach((workerInfo, id) => {
      const { worker, pid, isReady } = workerInfo;
      
      // If the worker has disconnected, skip
      if (worker.state === 'disconnected') return;

      // Skip health checks until the worker notifies it has bound to the port and is ready
      if (!isReady) {
        console.log(`[Primary] Worker ${pid} is still loading modules & connecting to database. Skipping health check.`);
        return;
      }

      workerInfo.missedPings++;
      console.log(`[Primary] Sending heartbeat ping to worker ${pid} (missed: ${workerInfo.missedPings - 1})...`);

      if (workerInfo.missedPings > MAX_MISSED_PINGS) {
        console.error(`[Primary] Worker ${pid} (ID: ${id}) failed to respond to ${MAX_MISSED_PINGS} consecutive heartbeat pings (Deadlock/Blocked event loop detected). Killing worker...`);
        // Remove worker from map first to prevent any race condition
        workers.delete(id);
        // Forcefully terminate the worker process
        worker.kill('SIGKILL');
        // Spawn a replacement worker immediately
        console.log(`[Primary] Spawning replacement worker for frozen worker ${pid}...`);
        spawnWorker();
      } else {
        // Send ping message to worker
        try {
          worker.send({ type: 'ping' });
        } catch (err) {
          console.error(`[Primary] Failed to send ping to worker ${pid}:`, err.message);
        }
      }
    });
  }, HEARTBEAT_INTERVAL);

  // Clean up on process termination
  process.on('SIGTERM', () => {
    console.log('[Primary] SIGTERM received. Terminating all workers gracefully...');
    clearInterval(heartbeatTimer);
    let activeWorkers = workers.size;

    if (activeWorkers === 0) {
      process.exit(0);
    }

    workers.forEach(({ worker }) => {
      worker.kill('SIGTERM');
      worker.on('exit', () => {
        activeWorkers--;
        if (activeWorkers === 0) {
          console.log('[Primary] All workers terminated. Exiting...');
          process.exit(0);
        }
      });
    });
  });

  // Initialize BullMQ workers strictly in the primary process
  const { initWorkers } = require('./queues/queueManager');
  initWorkers();
  console.log('[Primary] BullMQ workers initialized.');

  return; // Stop execution of the rest of the file for the primary process
}

// Single process mode (if cluster is not enabled)
if (!enableCluster) {
  const { initWorkers } = require('./queues/queueManager');
  initWorkers();
  console.log('[Worker] BullMQ workers initialized in single-process mode.');
}

// -------------------------------------------------------------
// WORKER PROCESS CODE (OR SINGLE PROCESS MODE)
// -------------------------------------------------------------
// Set up listener for heartbeats from Primary process
if (cluster.isWorker) {
  process.on('message', (msg) => {
    if (msg && msg.type === 'ping') {
      try {
        process.send({ type: 'pong', memory: process.memoryUsage().rss });
      } catch (err) {
        // Ignored if channel is closed
      }
    }
  });
}

console.log('Requiring express...');
const express = require('express');
console.log('Requiring helmet...');
const helmet = require('helmet');
console.log('Requiring passport...');
const passport = require('passport');
// Import passport configuration with GoogleStrategy
console.log('Requiring passport config...');
require('./features/auth/authMiddleware/passport');
console.log('Requiring cookie parser...');
const cookieParser = require('cookie-parser');
console.log('Requiring cors...');
const cors = require('cors');
console.log('Requiring session...');
const session = require('express-session');

console.log('Requiring connectDB...');
const connectDB = require('./db/database');
console.log('Requiring authRoutes...');
const authRoutes = require('./features/auth/authRoutes');
console.log('Requiring sanitize...');
const { mongoSanitizeMiddleware, xssSanitizeMiddleware } = require('./features/middleware/sanitize');
console.log('Requiring rateLimiter...');
const { apiLimiter, authLimiter, uploadLimiter } = require('./features/middleware/rateLimiter');

console.log('Initializing express app...');
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
// Using MongoStore for shared session storage across multiple clustered workers
console.log('Requiring connect-mongo...');
const MongoStore = require('connect-mongo').default || require('connect-mongo');
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false, // Recommended to be false when using database session stores to prevent saving empty sessions
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // Session TTL: 24 hours
  }),
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

console.log('Requiring other routes...');
const productRoutes = require('./features/products/productsRoutes');
const wishlistRoutes = require('./features/wishlist/wishlistRoutes');
const verificationRoutes = require('./features/auth/verificationRoutes');
const ordersRoutes = require('./features/orders/ordersRoutes');
const paymentRoutes = require('./features/payments/paymentRoutes');
const autocompleteRoutes = require('./features/autocomplete/autocompleteRoutes');

const PORT = process.env.PORT || 3001;
console.log('Connecting to DB...');
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

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (process.send) {
    process.send({ type: 'ready' });
  }
});

if (cluster.isWorker) {
  process.on('SIGTERM', () => {
    console.log(`[Worker ${process.pid}] SIGTERM received. Shutting down gracefully...`);
    server.close(async () => {
      console.log(`[Worker ${process.pid}] HTTP server closed.`);
      try {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close(false);
          console.log(`[Worker ${process.pid}] MongoDB connection closed.`);
        }
        const { getRedisClient } = require('./config/redis');
        const redis = getRedisClient();
        if (redis) {
          await redis.quit();
          console.log(`[Worker ${process.pid}] Redis connection closed.`);
        }
        process.exit(0);
      } catch (err) {
        console.error(`[Worker ${process.pid}] Error during shutdown:`, err);
        process.exit(1);
      }
    });

    setTimeout(() => {
      console.error(`[Worker ${process.pid}] Forceful shutdown after timeout`);
      process.exit(1);
    }, 10000);
  });
}