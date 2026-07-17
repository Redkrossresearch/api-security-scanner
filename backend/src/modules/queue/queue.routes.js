/**
 * Queue Status API Routes
 *
 * GET  /api/queue/status   — overall queue metrics
 * GET  /api/queue/jobs     — recent jobs list
 * GET  /api/queue/health   — redis + worker liveness check
 */
const express = require("express");
const authenticate = require("../../middleware/auth.middleware");
const { getQueueMetrics, getRecentJobs } = require("../../queue/scan.queue");
const { isRedisAvailable } = require("../../queue/redis.client");
const { getScanWorker } = require("../../queue/scan.worker");

const router = express.Router();

// GET /api/queue/status
router.get("/status", authenticate, async (req, res) => {
  if (!isRedisAvailable()) {
    return res.json({
      success: true,
      mode: "in-process",
      message: "Redis not configured — scans run in-process (no queue).",
      metrics: null,
    });
  }

  try {
    const metrics = await getQueueMetrics();
    const worker = getScanWorker();
    return res.json({
      success: true,
      mode: "queue",
      metrics,
      worker: {
        running: !!worker,
        concurrency: worker?.opts?.concurrency ?? 0,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/queue/jobs
router.get("/jobs", authenticate, async (req, res) => {
  if (!isRedisAvailable()) {
    return res.json({ success: true, mode: "in-process", jobs: [] });
  }
  try {
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const jobs = await getRecentJobs(limit);
    return res.json({ success: true, mode: "queue", jobs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/queue/health
router.get("/health", async (req, res) => {
  const redisUp = isRedisAvailable();
  const worker = getScanWorker();
  return res.json({
    success: true,
    redis: redisUp ? "connected" : "unavailable",
    worker: worker ? "running" : "stopped",
    mode: redisUp ? "queue" : "in-process",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
