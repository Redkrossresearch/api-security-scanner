/**
 * Scan Worker — BullMQ Worker that processes scan jobs.
 *
 * Runs the full scanner pipeline (same logic as scan.service.js) but
 * inside a BullMQ job context so scans are decoupled from the HTTP request.
 *
 * The worker is only started when Redis is available.
 */
const { Worker } = require("bullmq");
const mongoose = require("mongoose");

const Scan = require("../modules/scans/scan.model");
const Vulnerability = require("../modules/vulnerabilities/vulnerability.model");
const { createReport } = require("../modules/reports/report.service");
const scanEmitter = require("../sockets/emitters/scan.emitter");

const {
  scanSecurityHeaders,
} = require("../modules/scanner/security-header.scanner");
const { scanSSL } = require("../modules/scanner/ssl.scanner");
const { scanCORS } = require("../modules/scanner/cors.scanner");
const { scanCookies } = require("../modules/scanner/cookie.scanner");
const { scanTechnology } = require("../modules/scanner/technology.scanner");
const { scanServerDisclosure } = require("../modules/scanner/server.scanner");
const { scanJWT } = require("../modules/scanner/jwt.scanner");
const { scanOpenAPI } = require("../modules/scanner/openapi.scanner");
const {
  scanAttackSurface,
} = require("../modules/scanner/attack-surface.scanner");
const { scanRateLimit } = require("../modules/scanner/rate-limit.scanner");
const {
  scanApiInventory,
} = require("../modules/scanner/api-inventory.scanner");
const {
  scanEndpointRisk,
} = require("../modules/scanner/endpoint-risk.scanner");
const {
  calculateSecurityScore,
} = require("../modules/engines/security-score.engine");
const { crawlTarget } = require("../modules/scanner/web-crawler.service");
const { scanSQLi } = require("../modules/scanner/sql-injection.scanner");
const { scanXSS } = require("../modules/scanner/xss.scanner");
const {
  scanPathTraversal,
} = require("../modules/scanner/path-traversal.scanner");
const {
  scanCommandInjection,
} = require("../modules/scanner/command-injection.scanner");
const {
  scanExposedFiles,
} = require("../modules/scanner/exposed-files.scanner");

const QUEUE_NAME = "scan-queue";
let scanWorker = null;

/**
 * Process one scan job — mirrors the scan pipeline in scan.service.js but
 * reports progress via BullMQ job.updateProgress().
 */
const processScanJob = async (job) => {
  const { scanId, targetUrl } = job.data;

  console.log(`[Worker] Processing scan ${scanId} → ${targetUrl}`);
  await job.updateProgress(0);

  const SCANNERS = [
    "crawler",
    "security-header",
    "ssl",
    "cors",
    "cookie",
    "technology",
    "server",
    "jwt",
    "rate-limit",
    "openapi",
    "api-inventory",
    "attack-surface",
    "endpoint-risk",
    "sqli",
    "xss",
    "path-traversal",
    "command-injection",
    "exposed-files",
  ];
  const total = SCANNERS.length;
  let done = 0;

  const tick = async (currentScanner) => {
    done++;
    const percent = Math.round((done / total) * 100);
    await job.updateProgress(percent);
    scanEmitter.emitScanProgress(scanId, { scanId, percent, currentScanner });
  };

  const runScanner = async (name, scanFn, arg) => {
    try {
      scanEmitter.emitScanLog(scanId, {
        scanId,
        level: "info",
        message: `Starting scanner: ${name}`,
        ts: new Date(),
      });
      const result = await scanFn(arg !== undefined ? arg : targetUrl);
      scanEmitter.emitScanLog(scanId, {
        scanId,
        level: "info",
        message: `Completed scanner: ${name}`,
        ts: new Date(),
      });
      await tick(name);
      return result;
    } catch (err) {
      scanEmitter.emitScanLog(scanId, {
        scanId,
        level: "error",
        message: `Scanner failed: ${name} - ${err.message}`,
        ts: new Date(),
      });
      await tick(name);
      return [];
    }
  };

  // 1. Crawl
  let crawledEndpoints = [];
  try {
    scanEmitter.emitScanLog(scanId, {
      scanId,
      level: "info",
      message: "Starting web crawler...",
      ts: new Date(),
    });
    crawledEndpoints = await crawlTarget(targetUrl);
    scanEmitter.emitScanLog(scanId, {
      scanId,
      level: "info",
      message: `Web crawler completed: found ${crawledEndpoints.length} endpoints`,
      ts: new Date(),
    });
  } catch (err) {
    scanEmitter.emitScanLog(scanId, {
      scanId,
      level: "error",
      message: `Web crawler failed: ${err.message}`,
      ts: new Date(),
    });
  }
  await tick("crawler");

  // 2. Run all scanners in parallel
  const [
    headerFindings,
    sslFindings,
    corsFindings,
    cookieFindings,
    technologyFindings,
    serverFindings,
    jwtFindings,
    rateLimitFindings,
    openApiFindings,
    apiInventoryFindings,
    attackSurfaceFindings,
    endpointRiskFindings,
    sqliFindings,
    xssFindings,
    traversalFindings,
    commandFindings,
    exposedFileFindings,
  ] = await Promise.all([
    runScanner("security-header", scanSecurityHeaders),
    runScanner("ssl", scanSSL),
    runScanner("cors", scanCORS),
    runScanner("cookie", scanCookies),
    runScanner("technology", scanTechnology),
    runScanner("server", scanServerDisclosure),
    runScanner("jwt", scanJWT),
    runScanner("rate-limit", scanRateLimit),
    runScanner("openapi", scanOpenAPI),
    runScanner("api-inventory", scanApiInventory, {
      targetUrl,
      crawledEndpoints,
    }),
    runScanner("attack-surface", scanAttackSurface),
    runScanner("endpoint-risk", scanEndpointRisk),
    runScanner("sqli", scanSQLi, targetUrl),
    runScanner("xss", scanXSS, targetUrl),
    runScanner("path-traversal", scanPathTraversal, targetUrl),
    runScanner("command-injection", scanCommandInjection, targetUrl),
    runScanner("exposed-files", scanExposedFiles, targetUrl),
  ]);

  const allFindings = [
    ...headerFindings,
    ...sslFindings,
    ...corsFindings,
    ...cookieFindings,
    ...serverFindings,
    ...technologyFindings,
    ...jwtFindings,
    ...rateLimitFindings,
    ...openApiFindings,
    ...apiInventoryFindings,
    ...attackSurfaceFindings,
    ...endpointRiskFindings,
    ...sqliFindings,
    ...xssFindings,
    ...traversalFindings,
    ...commandFindings,
    ...exposedFileFindings,
  ];

  // Deduplicate
  const seenTitles = new Set();
  const findings = allFindings.filter((f) => {
    if (!f?.title) return false;
    const key = f.title.toLowerCase().trim();
    if (seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });

  const criticalCount = findings.filter(
    (v) => v.severity === "critical",
  ).length;
  const highCount = findings.filter((v) => v.severity === "high").length;
  const mediumCount = findings.filter((v) => v.severity === "medium").length;
  const lowCount = findings.filter((v) => v.severity === "low").length;
  const totalFindings = findings.length;

  const scoreData = calculateSecurityScore(findings);

  const dbScan = await Scan.findById(scanId);
  if (!dbScan) throw new Error(`Scan ${scanId} not found in DB`);

  dbScan.securityScore = scoreData.score;
  dbScan.grade = scoreData.grade;
  dbScan.riskLevel = scoreData.riskLevel;
  dbScan.criticalCount = criticalCount;
  dbScan.highCount = highCount;
  dbScan.mediumCount = mediumCount;
  dbScan.lowCount = lowCount;
  dbScan.totalFindings = totalFindings;
  dbScan.riskScore = Math.min(
    10,
    Number(
      (
        criticalCount * 1.5 +
        highCount * 0.8 +
        mediumCount * 0.3 +
        lowCount * 0.1
      ).toFixed(1),
    ),
  );
  dbScan.status = "completed";
  dbScan.completedAt = new Date();
  dbScan.duration = Math.round((dbScan.completedAt - dbScan.startedAt) / 1000);

  if (findings.length > 0) {
    const inserted = await Vulnerability.insertMany(
      findings.map((f) => ({
        scanId: dbScan._id,
        severity: f.severity,
        title: f.title,
        description: f.description,
        recommendation: f.recommendation,
        cwe: f.cwe,
        owasp: f.owasp,
        cvss: f.cvss,
        category: f.category,
        references: f.references,
        remediationSteps: f.remediationSteps,
        inventory: f.inventory || null,
        verified: f.verified || false,
        exploitPayload: f.exploitPayload || "",
        vulnerableParameter: f.vulnerableParameter || "",
        evidenceSnippet: f.evidenceSnippet || "",
        evidence: f.evidence || "",
        endpoint: f.endpoint || "",
      })),
    );
    inserted.forEach((vuln) => {
      scanEmitter.emitVulnerability(scanId, { scanId, finding: vuln });
    });
  }

  await dbScan.save();

  try {
    await createReport(dbScan, findings);
  } catch (err) {
    console.error("[Worker] Report generation failed:", err.message);
  }

  await job.updateProgress(100);
  scanEmitter.emitScanCompleted(scanId, dbScan.userId.toString(), {
    scanId,
    summary: {
      totalFindings,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      securityScore: dbScan.securityScore,
      grade: dbScan.grade,
      riskLevel: dbScan.riskLevel,
    },
  });

  try {
    const dashboardEmitter = require("../sockets/emitters/dashboard.emitter");
    dashboardEmitter.emitDashboardUpdate(dbScan.userId.toString(), {
      scanId,
      status: "completed",
    });
  } catch (err) {
    console.error("[Worker] Dashboard update emit failed:", err.message);
  }

  console.log(
    `[Worker] ✅ Scan ${scanId} completed (${totalFindings} findings).`,
  );

  return { scanId, totalFindings, criticalCount, highCount };
};

/**
 * Start the BullMQ scan worker.
 * Call this once during server bootstrap (only when Redis is available).
 */
const startScanWorker = (redisClient) => {
  if (scanWorker) return scanWorker; // already running

  scanWorker = new Worker(QUEUE_NAME, processScanJob, {
    connection: redisClient,
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || "3", 10),
    limiter: {
      max: 10,
      duration: 60_000,
    },
  });

  scanWorker.on("active", (job) => {
    console.log(`[Worker] Job ${job.id} started (scan: ${job.data.scanId})`);
    try {
      const queueEmitter = require("../sockets/emitters/queue.emitter");
      const { getQueueMetrics } = require("./scan.queue");
      getQueueMetrics().then((metrics) => {
        if (metrics) queueEmitter.emitQueueUpdate(job.data.userId, { metrics });
      });
    } catch (err) {
      console.error("[Worker] Active queue update failed:", err.message);
    }
  });

  scanWorker.on("completed", (job, result) => {
    console.log(`[Worker] Job ${job.id} completed →`, result);
    try {
      const queueEmitter = require("../sockets/emitters/queue.emitter");
      const { getQueueMetrics } = require("./scan.queue");
      getQueueMetrics().then((metrics) => {
        if (metrics) queueEmitter.emitQueueUpdate(job.data.userId, { metrics });
      });
    } catch (err) {
      console.error("[Worker] Completed queue update failed:", err.message);
    }
  });

  scanWorker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
    if (job?.data?.scanId) {
      Scan.findByIdAndUpdate(
        job.data.scanId,
        {
          status: "failed",
          completedAt: new Date(),
        },
        { new: true },
      )
        .then((dbScan) => {
          if (dbScan) {
            scanEmitter.emitScanFailed(
              job.data.scanId,
              dbScan.userId.toString(),
              {
                scanId: job.data.scanId,
                reason: err.message,
              },
            );
            // Real-time queue update
            try {
              const queueEmitter = require("../sockets/emitters/queue.emitter");
              const { getQueueMetrics } = require("./scan.queue");
              getQueueMetrics().then((metrics) => {
                if (metrics)
                  queueEmitter.emitQueueUpdate(dbScan.userId.toString(), {
                    metrics,
                  });
              });
            } catch (qeErr) {
              console.error(
                "[Worker] Failed job queue update failed:",
                qeErr.message,
              );
            }
            // Real-time dashboard update
            try {
              const dashboardEmitter = require("../sockets/emitters/dashboard.emitter");
              dashboardEmitter.emitDashboardUpdate(dbScan.userId.toString(), {
                scanId: job.data.scanId,
                status: "failed",
              });
            } catch (deErr) {
              console.error(
                "[Worker] Failed job dashboard update failed:",
                deErr.message,
              );
            }
          }
        })
        .catch(() => {});
    }
  });

  scanWorker.on("error", (err) => {
    console.error("[Worker] Worker error:", err.message);
  });

  console.log(
    `[Worker] 🚀 Scan worker started (concurrency: ${scanWorker.opts.concurrency})`,
  );
  return scanWorker;
};

const getScanWorker = () => scanWorker;

module.exports = { startScanWorker, getScanWorker };
