const { Queue, QueueEvents, Worker } = require('bullmq');
const path = require('path');
const Redis = require('ioredis');

const getRedisConnection = () => {
  const opts = { maxRetriesPerRequest: null };
  if (process.env.REDIS_URL) {
    const url = new URL(process.env.REDIS_URL);
    opts.host = url.hostname;
    opts.port = url.port;
    if (url.password) opts.password = url.password;
    if (process.env.REDIS_URL.startsWith('rediss://')) {
      opts.tls = { rejectUnauthorized: false };
    }
  } else {
    opts.host = '127.0.0.1';
    opts.port = 6379;
  }
  return opts;
};

const connection = getRedisConnection();

// Queues
const cloudinaryQueue = new Queue('cloudinary', { connection });
const aiQueue = new Queue('ai', { connection });

// Queue Events for waitUntilFinished
const cloudinaryQueueEvents = new QueueEvents('cloudinary', { connection });
const aiQueueEvents = new QueueEvents('ai', { connection });

let cloudinaryWorker;
let aiWorker;

const initWorkers = () => {
  if (!cloudinaryWorker) {
    cloudinaryWorker = new Worker('cloudinary', path.join(__dirname, 'cloudinaryProcessor.js'), { connection, concurrency: 5 });
  }
  if (!aiWorker) {
    aiWorker = new Worker('ai', path.join(__dirname, 'aiProcessor.js'), { connection, concurrency: 5 });
  }
};

module.exports = {
  cloudinaryQueue,
  aiQueue,
  cloudinaryQueueEvents,
  aiQueueEvents,
  initWorkers
};
