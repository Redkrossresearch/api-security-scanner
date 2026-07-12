const Scan = require("./scan.model");

const Vulnerability = require("../vulnerabilities/vulnerability.model");
const { createReport } = require("../reports/report.service");
const { scanSecurityHeaders } = require("../scanner/security-header.scanner");
const { scanSSL } = require("../scanner/ssl.scanner");
const { scanCORS } = require("../scanner/cors.scanner");
const { scanCookies } = require("../scanner/cookie.scanner");
const { scanTechnology } = require("../scanner/technology.scanner");
const { scanServerDisclosure } = require("../scanner/server.scanner");
const { scanJWT } = require("../scanner/jwt.scanner");
const { scanOpenAPI } = require("../scanner/openapi.scanner");
const { scanAttackSurface } = require("../scanner/attack-surface.scanner");
const { scanRateLimit } = require("../scanner/rate-limit.scanner");
const { scanApiInventory } = require("../scanner/api-inventory.scanner");
const { scanEndpointRisk } = require("../scanner/endpoint-risk.scanner");
const { calculateSecurityScore } = require("../engines/security-score.engine");

// Active Scanners & Crawler
const { crawlTarget } = require("../scanner/web-crawler.service");
const { scanSQLi } = require("../scanner/sql-injection.scanner");
const { scanXSS } = require("../scanner/xss.scanner");
const { scanPathTraversal } = require("../scanner/path-traversal.scanner");
const { scanCommandInjection } = require("../scanner/command-injection.scanner");
const { scanExposedFiles } = require("../scanner/exposed-files.scanner");

// ✅ FIX 2: Added random suffix to prevent duplicate scanIds
const activeScans = new Map();

const generateScanId = () => {
  return `SCAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const getActiveScanProgress = (scanId) => {
  return activeScans.get(scanId.toString()) || null;
};

const createScan = async (userId, targetUrl) => {
  const scan = await Scan.create({
    userId,
    targetUrl,

    scanId: generateScanId(),

    // ✅ FIX 1: Safer hostname extraction (no crash on missing protocol)
    assetName: targetUrl
      .replace("https://", "")
      .replace("http://", "")
      .split("/")[0],

    profile: "Full Security Audit",

    environment: "production",

    status: "running",

    startedAt: new Date(),
  });

  const scanIdString = scan._id.toString();

  activeScans.set(scanIdString, {
    scanId: scan.scanId,
    status: "running",
    progress: 0,
    scanners: {
      "security-header": "pending",
      "ssl": "pending",
      "cors": "pending",
      "cookie": "pending",
      "technology": "pending",
      "server": "pending",
      "jwt": "pending",
      "rate-limit": "pending",
      "openapi": "pending",
      "api-inventory": "pending",
      "attack-surface": "pending",
      "endpoint-risk": "pending"
    }
  });

  // Start the scan pipeline in the background
  (async () => {
    // 1. Initialize scanners state tracker
    const active = activeScans.get(scanIdString);
    if (active) {
      active.scanners = {
        ...active.scanners,
        "crawler": "pending",
        "sqli": "pending",
        "xss": "pending",
        "path-traversal": "pending",
        "command-injection": "pending",
        "exposed-files": "pending"
      };
    }

    const runScanner = async (name, scanFn, arg) => {
      if (active) active.scanners[name] = "running";
      try {
        const findings = await scanFn(arg || targetUrl);
        if (active) {
          active.scanners[name] = "completed";
          const keys = Object.keys(active.scanners);
          const completed = keys.filter(k => active.scanners[k] === "completed").length;
          active.progress = Math.round((completed / keys.length) * 100);
        }
        return findings;
      } catch (err) {
        if (active) {
          active.scanners[name] = "failed";
        }
        return [];
      }
    };

    try {
      // Run Web Crawler first to get local URLs and parameters
      if (active) active.scanners["crawler"] = "running";
      const crawledEndpoints = await crawlTarget(targetUrl);
      if (active) active.scanners["crawler"] = "completed";

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
        runScanner("api-inventory", scanApiInventory, { targetUrl, crawledEndpoints }),
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

      // Deduplicate findings by Title (no repetition)
      const seenTitles = new Set();
      const findings = allFindings.filter((f) => {
        if (!f || !f.title) return false;
        const titleKey = f.title.toLowerCase().trim();
        if (seenTitles.has(titleKey)) return false;
        seenTitles.add(titleKey);
        return true;
      });

      const criticalCount = findings.filter(
        (v) => v.severity === "critical"
      ).length;

      const highCount = findings.filter(
        (v) => v.severity === "high"
      ).length;

      const mediumCount = findings.filter(
        (v) => v.severity === "medium"
      ).length;

      const lowCount = findings.filter(
        (v) => v.severity === "low"
      ).length;

      const totalFindings = findings.length;

      const scoreData = calculateSecurityScore(findings);

      const dbScan = await Scan.findById(scanIdString);
      if (!dbScan) return;

      dbScan.securityScore = scoreData.score;
      dbScan.grade = scoreData.grade;
      dbScan.riskLevel = scoreData.riskLevel;
      dbScan.criticalCount = criticalCount;
      dbScan.highCount = highCount;
      dbScan.mediumCount = mediumCount;
      dbScan.lowCount = lowCount;
      dbScan.totalFindings = totalFindings;

      dbScan.riskScore =
        criticalCount * 1.5 +
        highCount * 0.8 +
        mediumCount * 0.3 +
        lowCount * 0.1;

      dbScan.riskScore = Math.min(
        10,
        Number(dbScan.riskScore.toFixed(1))
      );

      dbScan.status = "completed";
      dbScan.completedAt = new Date();

      dbScan.duration = Math.round(
        (dbScan.completedAt - dbScan.startedAt) / 1000
      );

      if (findings.length > 0) {
        await Vulnerability.insertMany(
          findings.map((finding) => ({
            scanId: dbScan._id,
            severity: finding.severity,
            title: finding.title,
            description: finding.description,
            recommendation: finding.recommendation,
            cwe: finding.cwe,
            owasp: finding.owasp,
            cvss: finding.cvss,
            category: finding.category,
            references: finding.references,
            remediationSteps: finding.remediationSteps,
            inventory: finding.inventory || null,
            verified: finding.verified || false,
            exploitPayload: finding.exploitPayload || "",
            vulnerableParameter: finding.vulnerableParameter || "",
            evidenceSnippet: finding.evidenceSnippet || "",
            evidence: finding.evidence || "",
            endpoint: finding.endpoint || "",
          })),
        );
      }
      await dbScan.save();

      try {
        await createReport(dbScan, findings);
      } catch (error) {
        console.error("Report generation failed:", error);
      }

      if (active) {
        active.status = "completed";
        active.progress = 100;
      }
      setTimeout(() => activeScans.delete(scanIdString), 2 * 60 * 1000);

    } catch (error) {
      console.error("Background scan failed:", error);
      if (active) {
        active.status = "failed";
      }
      setTimeout(() => activeScans.delete(scanIdString), 2 * 60 * 1000);

      const dbScan = await Scan.findById(scanIdString);
      if (dbScan) {
        dbScan.status = "failed";
        dbScan.completedAt = new Date();
        dbScan.duration = Math.round(
          (dbScan.completedAt - dbScan.startedAt) / 1000
        );
        await dbScan.save();
      }
    }
  })();

  return scan;
};

const getUserScans = async (userId) => {
  return Scan.find({
    userId,
  }).sort({
    createdAt: -1,
  });
};

module.exports = {
  createScan,
  getUserScans,
  getActiveScanProgress,
};