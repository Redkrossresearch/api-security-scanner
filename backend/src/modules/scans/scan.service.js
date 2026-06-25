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

// ✅ FIX 2: Added random suffix to prevent duplicate scanIds
const generateScanId = () => {
  return `SCAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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

  try {
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
    ] = await Promise.all([
      scanSecurityHeaders(targetUrl),
      scanSSL(targetUrl),
      scanCORS(targetUrl),
      scanCookies(targetUrl),
      scanTechnology(targetUrl),
      scanServerDisclosure(targetUrl),
      scanJWT(targetUrl),
      scanRateLimit(targetUrl),
      scanOpenAPI(targetUrl),
      scanApiInventory(targetUrl),
      scanAttackSurface(targetUrl),
      scanEndpointRisk(targetUrl),
    ]);

    const findings = [
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
    ];

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

    scan.vulnerabilities = findings;

    scan.securityScore = scoreData.score;

    scan.grade = scoreData.grade;

    scan.riskLevel = scoreData.riskLevel;

    scan.criticalCount = criticalCount;

    scan.highCount = highCount;

    scan.mediumCount = mediumCount;

    scan.lowCount = lowCount;

    scan.totalFindings = totalFindings;

    scan.riskScore =
      criticalCount * 1.5 +
      highCount * 0.8 +
      mediumCount * 0.3 +
      lowCount * 0.1;

    scan.riskScore = Math.min(
      10,
      Number(scan.riskScore.toFixed(1))
    );

    scan.status = "completed";

    scan.completedAt = new Date();

    // ✅ UNTOUCHED: Duration stays in seconds (frontend will convert)
    scan.duration = Math.round(
      (scan.completedAt - scan.startedAt) / 1000
    );

    if (findings.length > 0) {
      await Vulnerability.insertMany(
        findings.map((finding) => ({
          scanId: scan._id,

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
        })),
      );
    }
    await scan.save();

    try {
      await createReport(scan, findings);
    } catch (error) {
      console.error("Report generation failed:", error);
    }

    return scan;
  } catch (error) {
    scan.status = "failed";

    scan.completedAt = new Date();

    // ✅ UNTOUCHED: Duration stays in seconds for failed scans too
    scan.duration = Math.round(
      (scan.completedAt - scan.startedAt) / 1000
    );

    await scan.save();

    throw error;
  }
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
};