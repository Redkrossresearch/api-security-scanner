/**
 * Redis client singleton with graceful no-Redis fallback.
 * When REDIS_URL is not set or Redis is unreachable the app continues
 * to work using the legacy in-process scan pipeline.
 */
const { Redis } = require("ioredis");

let redisClient = null;
let redisAvailable = false;

const REDIS_URL = process.env.REDIS_URL || null;

const createRedisClient = () => {
  if (!REDIS_URL) {
    console.warn(
      "[Queue] REDIS_URL not configured — running without Redis queue (in-process mode).",
    );
    return null;
  }

  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, // BullMQ requirement
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 3) {
        console.error(
          "[Queue] Redis connection failed after 3 retries — disabling queue.",
        );
        redisAvailable = false;
        return null; // stop retrying
      }
      return Math.min(times * 500, 2000);
    },
  });

  client.on("connect", () => {
    redisAvailable = true;
    console.log("[Queue] ✅ Redis connected.");
  });

  client.on("error", (err) => {
    if (redisAvailable) {
      console.error("[Queue] Redis error:", err.message);
      redisAvailable = false;
    }
  });

  client.on("close", () => {
    redisAvailable = false;
  });

  return client;
};

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createRedisClient();
    if (redisClient) {
      redisClient.connect().catch(() => {
        redisAvailable = false;
      });
    }
  }
  return redisClient;
};

const isRedisAvailable = () => redisAvailable;

module.exports = { getRedisClient, isRedisAvailable };
