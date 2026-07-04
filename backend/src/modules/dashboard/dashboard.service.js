const Scan = require("../scans/scan.model");
const Vulnerability = require("../vulnerabilities/vulnerability.model");

// ✅ Fix 2 & 3: Updated imports
const {
  SCAN_FIELDS,
  LATEST_SCAN_FIELDS,
  CACHE_TTL,
} = require("../constants/dashboard.constants");

const dashboardCache = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of dashboardCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      dashboardCache.delete(key);
    }
  }
}, CACHE_TTL);

const log = (message) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(message);
  }
};

const logTable = (data) => {
  if (process.env.NODE_ENV !== "production") {
    console.table(data);
  }
};

const getDashboardStats = async (
  page = 1,
  limit = 5,
  range = "7D",
) => {
  const serviceStart = Date.now();

  const cacheKey = `dashboard-${page}-${limit}-${range}`;
  const cached = dashboardCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    log("⚡ Dashboard Cache HIT");
    logTable({ Cache: "HIT", Page: page, Range: range });
    return cached.data;
  }

  log("📦 Dashboard Cache MISS");

  const skip = (page - 1) * limit;
  const queryStart = Date.now();

  // ✅ Sprint 1.4: Dynamic Trend Range
  let days = 7;
  switch (range) {
    case "24H":
      days = 1;
      break;
    case "30D":
      days = 30;
      break;
    case "90D":
      days = 90;
      break;
    default:
      days = 7;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [
    scans,
    scanAnalytics,
    latestScans,
    vulnerabilityAnalytics,
    securityTrend,
    activityTimeline,
  ] = await Promise.all([
    // ✅ Fix 3: Using SCAN_FIELDS constant
    Scan.find().select(SCAN_FIELDS).lean(),

    Scan.aggregate([
      {
        $facet: {
          averageScore: [
            { $group: { _id: null, averageScore: { $avg: "$securityScore" } } },
          ],
          riskDistribution: [
            { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
          ],
          gradeDistribution: [
            { $group: { _id: "$grade", count: { $sum: 1 } } },
          ],
          latestScanId: [
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            { $project: { _id: 1 } },
          ],
        },
      },
    ]),

    Scan.find()
      .select(LATEST_SCAN_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Vulnerability.aggregate([
      {
        $facet: {
          severityDistribution: [
            { $group: { _id: "$severity", count: { $sum: 1 } } },
          ],
          averageCvss: [
            { $group: { _id: null, averageCvss: { $avg: "$cvss" } } },
          ],
          topFindings: [
            { $group: { _id: "$title", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { _id: 0, title: "$_id", count: 1 } },
          ],
          owaspDistribution: [
            { $match: { owasp: { $exists: true, $ne: null } } },
            { $group: { _id: "$owasp", count: { $sum: 1 } } },
          ],
          cweDistribution: [
            { $match: { cwe: { $exists: true, $ne: null } } },
            { $group: { _id: "$cwe", count: { $sum: 1 } } },
          ],
        },
      },
    ]),

    Scan.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          score: {
            $avg: "$securityScore",
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          score: {
            $round: ["$score", 0],
          },
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]),

    Scan.aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 0,
          targetUrl: 1,
          score: "$securityScore",
          riskLevel: 1,
          createdAt: 1,
        },
      },
    ]),
  ]);

  log(`🗄️ All Queries (6 parallel): ${Date.now() - queryStart}ms`);

  const totalScans = scans.length;

  const totalPages = Math.ceil(totalScans / limit);
  const pagination = {
    page,
    limit,
    totalItems: totalScans,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };

  const averageScoreResult = scanAnalytics[0].averageScore;
  const riskDistributionResult = scanAnalytics[0].riskDistribution;
  const gradeDistributionResult = scanAnalytics[0].gradeDistribution;
  const latestScanId = scanAnalytics[0].latestScanId[0]?._id;

  const averageScore =
    averageScoreResult.length > 0
      ? Math.round(averageScoreResult[0].averageScore)
      : 0;

  const riskDistribution = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  riskDistributionResult.forEach((item) => {
    if (riskDistribution[item._id] !== undefined) {
      riskDistribution[item._id] = item.count;
    }
  });

  const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  gradeDistributionResult.forEach((item) => {
    if (gradeDistribution[item._id] !== undefined) {
      gradeDistribution[item._id] = item.count;
    }
  });

  const uniqueAssets = new Set(
    scans.map((scan) => {
      try {
        return new URL(scan.targetUrl).hostname;
      } catch {
        return scan.targetUrl;
      }
    }),
  );

  const apiInventory = {
    totalApis: uniqueAssets.size,
    totalAssets: uniqueAssets.size,
  };

  const severityDistributionResult = vulnerabilityAnalytics[0].severityDistribution;
  const averageCvssResult = vulnerabilityAnalytics[0].averageCvss;
  const topFindings = vulnerabilityAnalytics[0].topFindings;
  const owaspDistributionResult = vulnerabilityAnalytics[0].owaspDistribution;
  const cweDistributionResult = vulnerabilityAnalytics[0].cweDistribution;

  const severityDistribution = {
    critical: 0, high: 0, medium: 0, low: 0, info: 0,
  };
  severityDistributionResult.forEach((item) => {
    const severity = item._id?.toLowerCase();
    if (severityDistribution[severity] !== undefined) {
      severityDistribution[severity] = item.count;
    }
  });

  const averageCvss =
    averageCvssResult.length > 0
      ? Number(averageCvssResult[0].averageCvss.toFixed(1))
      : 0;

  const owaspDistribution = {};
  owaspDistributionResult.forEach((item) => {
    owaspDistribution[item._id] = item.count;
  });

  const cweDistribution = {};
  cweDistributionResult.forEach((item) => {
    cweDistribution[item._id] = item.count;
  });

  const riskMetrics = {
    critical: severityDistribution.critical,
    high: severityDistribution.high,
    medium: severityDistribution.medium,
    low: severityDistribution.low,
    total:
      severityDistribution.critical +
      severityDistribution.high +
      severityDistribution.medium +
      severityDistribution.low +
      severityDistribution.info,
  };

  const criticalStart = Date.now();

  const criticalFindings = await Vulnerability.aggregate([
    {
      $match: {
        scanId: latestScanId,
        severity: "critical",
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        severity: 1,
        status: 1,
        createdAt: 1,
        apiName: 1,
        targetUrl: 1,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);

  log(`🚨 Critical Findings: ${Date.now() - criticalStart}ms`);

  const executiveSummary = {
    criticalCount: severityDistribution.critical,
    highCount: severityDistribution.high,
    topRisk: criticalFindings[0]?.title || "None",
    mostCommonIssue: topFindings[0]?.title || "None",
    exposureLevel:
      severityDistribution.critical > 0
        ? "Critical"
        : severityDistribution.high > 10
          ? "High"
          : severityDistribution.medium > 20
            ? "Medium"
            : "Low",
  };

  const failed = severityDistribution.critical + severityDistribution.high;
  const warning = severityDistribution.medium;
  const passed = severityDistribution.low + severityDistribution.info;
  const totalChecks = passed + warning + failed;
  const complianceScore =
    totalChecks > 0 ? Math.round((passed / totalChecks) * 100) : 100;

  const complianceRadarData = [
    { subject: "A1", value: 100 },
    { subject: "A2", value: 100 },
    { subject: "A3", value: 100 },
    { subject: "A4", value: 100 },
    { subject: "A5", value: 100 },
    { subject: "A6", value: 100 },
    { subject: "A7", value: 100 },
    { subject: "A8", value: 100 },
    { subject: "A9", value: 100 },
    { subject: "A10", value: 100 },
  ];

  const allVulnerabilities = await Vulnerability.find().lean();
  allVulnerabilities.forEach((v) => {
    const owaspStr = String(v.owasp || "").toUpperCase();
    let index = -1;
    for (let i = 1; i <= 10; i++) {
      if (
        owaspStr.includes(`A${i}:`) || 
        owaspStr.includes(`A0${i}:`) || 
        owaspStr.includes(`API${i}:`) ||
        owaspStr.startsWith(`A${i} `) ||
        owaspStr.startsWith(`A0${i} `)
      ) {
        index = i - 1;
        break;
      }
    }
    if (index !== -1) {
      let deduction = 5;
      if (v.severity?.toLowerCase() === "critical") deduction = 25;
      else if (v.severity?.toLowerCase() === "high") deduction = 15;
      else if (v.severity?.toLowerCase() === "medium") deduction = 10;
      complianceRadarData[index].value = Math.max(30, complianceRadarData[index].value - deduction);
    }
  });

  const response = {
    totalScans,
    averageScore,
    latestScans,
    riskMetrics,
    executiveSummary,
    averageCvss,
    owaspDistribution,
    cweDistribution,
    severityDistribution,
    riskDistribution,
    gradeDistribution,
    topFindings,
    criticalFindings,
    complianceOverview: {
      score: complianceScore,
      passed,
      warning,
      failed,
    },
    complianceRadarData,
    securityTrend,
    activityTimeline,
    apiInventory,
    pagination,
  };

  dashboardCache.set(cacheKey, {
    data: response,
    timestamp: Date.now(),
  });

  log("✅ Dashboard Cache Stored");

  logTable({
    TotalScans: totalScans,
    LatestScans: latestScans.length,
    CriticalFindings: criticalFindings.length,
    Range: range,
    Cache: "MISS",
  });

  const responseSize = Buffer.byteLength(JSON.stringify(response), "utf8");
  log(`📤 Response Size: ${(responseSize / 1024).toFixed(2)} KB`);

  const memory = process.memoryUsage();
  const heapPercentage = (memory.heapUsed / memory.heapTotal) * 100;
  log(`🧠 Heap Usage: ${heapPercentage.toFixed(2)}%`);
  log(`🧠 Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  log(`📦 RSS Memory: ${(memory.rss / 1024 / 1024).toFixed(2)} MB`);

  const serviceTime = Date.now() - serviceStart;
  log(`⚙️ Dashboard Service Time: ${serviceTime}ms`);

  return response;
};

// ✅ Fix: Added getScanDetails function
const getScanDetails = async (id) => {
  const scan = await Scan.findById(id).lean();

  if (!scan) {
    throw new Error("Scan not found");
  }

  const vulnerabilities = await Vulnerability.find({ scanId: id }).lean();
  scan.vulnerabilities = vulnerabilities;

  return scan;
};

// Helper to safely parse hostnames without throwing exceptions
const extractHostname = (urlStr) => {
  try {
    if (!urlStr) return "api.gateway";
    let cleanUrl = urlStr.trim();
    if (cleanUrl.startsWith("/")) return "api.gateway";
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "http://" + cleanUrl;
    }
    return new URL(cleanUrl).hostname;
  } catch (e) {
    return "api.gateway";
  }
};

// Compile real-time activity logs from scans and vulnerabilities database
const getDashboardActivityLogs = async () => {
  const [scans, vulnerabilities] = await Promise.all([
    Scan.find().sort({ createdAt: -1 }).limit(10).lean(),
    Vulnerability.find().sort({ createdAt: -1 }).limit(30).lean()
  ]);

  const compiledLogs = [];

  scans.forEach((scan) => {
    const scanTime = new Date(scan.createdAt);
    const timeStr = scanTime.toTimeString().split(" ")[0];
    const targetHost = extractHostname(scan.targetUrl || scan.target);

    compiledLogs.push({
      id: `scan-init-${scan.scanId || scan._id}`,
      timestamp: scanTime.getTime(),
      time: timeStr,
      type: "info",
      text: `Scanner engine initialized dynamic audit for target: ${targetHost}`
    });

    compiledLogs.push({
      id: `scan-done-${scan.scanId || scan._id}`,
      timestamp: scanTime.getTime() + 10000,
      time: new Date(scanTime.getTime() + 10000).toTimeString().split(" ")[0],
      type: "pass",
      text: `Security posture audit completed for ${targetHost}. Score: ${scan.securityScore || scan.score || 85}/100 | Grade: ${scan.grade || "B"}`
    });
  });

  vulnerabilities.forEach((vuln) => {
    const vulnTime = new Date(vuln.createdAt || Date.now());
    const timeStr = vulnTime.toTimeString().split(" ")[0];
    const host = extractHostname(vuln.inventory?.endpoint || vuln.endpoint);

    compiledLogs.push({
      id: `vuln-${vuln._id}`,
      timestamp: vulnTime.getTime(),
      time: timeStr,
      type: vuln.severity?.toLowerCase() === "critical" || vuln.severity?.toLowerCase() === "high" ? "alert" : "warn",
      text: `Security Alert: Identified [${vuln.severity || "Medium"}] ${vuln.title} on endpoint: ${host}`
    });
  });

  // Sort chronologically (oldest first)
  compiledLogs.sort((a, b) => a.timestamp - b.timestamp);

  return compiledLogs.slice(-25); // return last 25 logs
};

// ✅ Fix: Updated exports to include getScanDetails and getDashboardActivityLogs
module.exports = {
  getDashboardStats,
  getScanDetails,
  getDashboardActivityLogs,
};