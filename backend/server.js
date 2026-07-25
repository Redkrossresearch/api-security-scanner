const app = require("./src/app");
const connectDB = require("./src/config/db");
const env = require("./src/config/env");
const scheduler = require("./src/modules/scheduler/scheduler.service");
const {
  getRedisClient,
  isRedisAvailable,
} = require("./src/queue/redis.client");
const { startScanWorker } = require("./src/queue/scan.worker");

const startServer = async () => {
  try {
    await connectDB();

    // Seed Threat Intelligence & GitHub Advisories (Sprint 35 RAG Ingestion)
    const externalSources = require("./src/modules/llm/rag/external.sources");
    externalSources.seedThreatCatalog().catch((e) =>
      console.error("Threat catalog seeding failed:", e.message),
    );
    externalSources.syncGitHubAdvisories().catch((e) =>
      console.error("GitHub advisory sync failed:", e.message),
    );

    // Seed Forensic Audit Logs (Black Box Recorder)
    const auditService = require("./src/modules/audit/audit.service");
    auditService.seedAuditLogs().catch((e) =>
      console.error("Audit log seeding failed:", e.message)
    );

    // Start automated background scanner service
    scheduler.start();

    // Bootstrap Redis client (lazy — does not block if Redis is unavailable)
    const redis = getRedisClient();

    // Wait briefly to let Redis handshake complete before starting worker
    if (redis) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (isRedisAvailable()) {
        startScanWorker(redis);
      } else {
        console.warn(
          "[Server] Redis not yet available — worker will not start. Scans run in-process.",
        );
      }
    }

    const http = require("http");
    const { createSocketServer } = require("./src/sockets");
    const server = http.createServer(app);
    createSocketServer(server);

    server.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port}`);
      console.log(
        `⚡ Scan mode: ${isRedisAvailable() ? "BullMQ queue" : "in-process"}`,
      );
    });
  } catch (error) {
    console.error("❌ Server startup failed");
    console.error(error);
    process.exit(1);
  }
};

startServer();
