const Redis = require('ioredis');

let client = null;
let ready = false;
let connecting = false;

/**
 * Returns a singleton Redis Cloud client.
 * Connects via TLS using the REDIS_URL env variable.
 * Format: rediss://:<password>@<host>:<port>
 */
const getRedisClient = () => {
  if (client) return client;

  if (!process.env.REDIS_URL) {
    console.warn('[Redis] REDIS_URL not set — caching and distributed rate limiting disabled.');
    return null;
  }

  const redisUrl = process.env.REDIS_URL.trim();
  const isTls = redisUrl.startsWith('rediss://');

  client = new Redis(redisUrl, {
    ...(isTls ? { tls: { rejectUnauthorized: false } } : {}),
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 5) {
        console.error('[Redis] Max retries reached. Giving up.');
        return null; // Stop retrying
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  client.on('ready', () => {
    ready = true;
    console.log('[Redis] Connected');
  });
  client.on('error', (err) => {
    ready = false;
    console.error('[Redis] Connection error:', err.message);
  });
  client.on('close', () => {
    ready = false;
    console.warn('[Redis] Connection closed');
  });

  if (!connecting) {
    connecting = true;
    client.connect().catch((err) => {
      ready = false;
      console.error('[Redis] Failed to connect on startup:', err.message);
    }).finally(() => {
      connecting = false;
    });
  }

  return client;
};

const isRedisReady = () => ready;

/**
 * Get a cached value. Returns null if key doesn't exist or Redis is unavailable.
 * @param {string} key
 * @returns {Promise<any|null>}
 */
const cacheGet = async (key) => {
  try {
    const redis = getRedisClient();
    if (!redis || !isRedisReady()) return null;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`[Redis] cacheGet error for key "${key}":`, err.message);
    return null;
  }
};

/**
 * Set a cache value with an optional TTL in seconds.
 * @param {string} key
 * @param {any} value - Will be JSON.stringify'd
 * @param {number} [ttl=60] - Time to live in seconds
 */
const cacheSet = async (key, value, ttl = 60) => {
  try {
    const redis = getRedisClient();
    if (!redis || !isRedisReady()) return;
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (err) {
    console.error(`[Redis] cacheSet error for key "${key}":`, err.message);
  }
};

/**
 * Delete one or more cache keys (supports glob patterns via SCAN).
 * @param {...string} keys
 */
const cacheDel = async (...keys) => {
  try {
    const redis = getRedisClient();
    if (!redis || !isRedisReady() || keys.length === 0) return;
    await redis.del(...keys);
  } catch (err) {
    console.error(`[Redis] cacheDel error:`, err.message);
  }
};

/**
 * Delete all keys matching a pattern (e.g. "products:list:*").
 * Uses SCAN to avoid blocking the Redis server.
 * @param {string} pattern
 */
const cacheDelPattern = async (pattern) => {
  try {
    const redis = getRedisClient();
    if (!redis || !isRedisReady()) return;

    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch (err) {
    console.error(`[Redis] cacheDelPattern error for pattern "${pattern}":`, err.message);
  }
};

module.exports = { getRedisClient, isRedisReady, cacheGet, cacheSet, cacheDel, cacheDelPattern };
