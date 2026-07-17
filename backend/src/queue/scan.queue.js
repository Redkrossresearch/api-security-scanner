/**
 * Scan Queue — BullMQ Queue definition.
 * Publishes scan jobs when Redis is available.
 */
const { Queue } = require("bullmq");
const { getRedisClient } = require("./redis.client");

const QUEUE_NAME = "scan-queue";
let scanQueue = null;

const getScanQueue = () => {
  const redis = getRedisClient();
  if (!redis || !scanQueue) {
    if (redis && !scanQueue) {
      scanQueue = new Queue(QUEUE_NAME, {
        connection: redis,
        defaultJobOptions: {
          attempts: 2,
          backoff: { type: "exponential", delay: 3000 },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 50 },
        },
      });
      console.log("[Queue] Scan queue initialised.");
    }
  }
  return scanQueue;
};

/**
 * Add a scan job to the queue.
 * @param {string} scanId      - MongoDB ObjectId string of the scan
 * @param {string} userId      - MongoDB ObjectId string of the user
 * @param {string} targetUrl   - target URL to scan
 * @returns {Promise<Job|null>}
 */
const enqueueScan = async (scanId, userId, targetUrl) => {
  const queue = getScanQueue();
  if (!queue) return null;
  const job = await queue.add(
    "run-scan",
    { scanId, userId, targetUrl },
    { jobId: scanId },
  );
  console.log(`[Queue] Enqueued scan job ${job.id}`);

  // Real-time queue notification
  try {
    const queueEmitter = require("../sockets/emitters/queue.emitter");
    getQueueMetrics().then((metrics) => {
      if (metrics) {
        queueEmitter.emitQueueUpdate(userId, { metrics });
      }
    });
  } catch (err) {
    console.error("[Queue] Queue update emit failed:", err.message);
  }

  return job;
};

/**
 * Get queue metrics for the status API.
 */
const getQueueMetrics = async () => {
  const queue = getScanQueue();
  if (!queue) return null;
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);
  return { waiting, active, completed, failed, delayed };
};

/**
 * Get recent jobs (last N) for monitoring dashboard.
 */
const getRecentJobs = async (limit = 20) => {
  const queue = getScanQueue();
  if (!queue) return [];

  const [active, waiting, completed, failed] = await Promise.all([
    queue.getActive(0, limit),
    queue.getWaiting(0, limit),
    queue.getCompleted(0, limit),
    queue.getFailed(0, limit),
  ]);

  const format = (jobs, state) =>
    jobs.map((j) => ({
      jobId: j.id,
      scanId: j.data?.scanId,
      targetUrl: j.data?.targetUrl,
      state,
      attemptsMade: j.attemptsMade,
      timestamp: j.timestamp,
      processedOn: j.processedOn,
      finishedOn: j.finishedOn,
      failedReason: j.failedReason,
    }));

  return [
    ...format(active, "active"),
    ...format(waiting, "waiting"),
    ...format(completed, "completed"),
    ...format(failed, "failed"),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

module.exports = { getScanQueue, enqueueScan, getQueueMetrics, getRecentJobs };
