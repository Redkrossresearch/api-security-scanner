const Scan = require("../scans/scan.model");

const Vulnerability = require("../vulnerabilities/vulnerability.model");

const getDashboardStats = async (req, res) => {
  try {
    const scans = await Scan.find();

    const totalScans = scans.length;

    const severityDistribution = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    scans.forEach((scan) => {
      scan.vulnerabilities.forEach((vuln) => {
        if (severityDistribution[vuln.severity] !== undefined) {
          severityDistribution[vuln.severity]++;
        }
      });
    });

    const riskDistribution = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };

    scans.forEach((scan) => {
      if (riskDistribution[scan.riskLevel] !== undefined) {
        riskDistribution[scan.riskLevel]++;
      }
    });

    const gradeDistribution = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0,
    };

    scans.forEach((scan) => {
      if (gradeDistribution[scan.grade] !== undefined) {
        gradeDistribution[scan.grade]++;
      }
    });

    const averageScore =
      totalScans > 0
        ? Math.round(
            scans.reduce((sum, scan) => sum + scan.securityScore, 0) /
              totalScans,
          )
        : 0;

    const securityTrend = scans.slice(-7).map((scan) => ({
      date: scan.createdAt,
      score: scan.securityScore,
    }));

    const activityTimeline = scans.slice(0, 10).map((scan) => ({
      targetUrl: scan.targetUrl,
      score: scan.securityScore,
      riskLevel: scan.riskLevel,
      createdAt: scan.createdAt,
    }));

    const apiInventory = {
      totalApis: scans.length,
    };

    const latestScans = await Scan.find()
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .select("targetUrl securityScore grade riskLevel createdAt");

    const vulnerabilities = await Vulnerability.find();

    const averageCvss =
      vulnerabilities.length > 0
        ? Number(
            (
              vulnerabilities.reduce((sum, vuln) => sum + (vuln.cvss || 0), 0) /
              vulnerabilities.length
            ).toFixed(1),
          )
        : 0;

    const owaspDistribution = {};

    const cweDistribution = {};

    const riskMetrics = {
      critical: severityDistribution.critical,

      high: severityDistribution.high,

      medium: severityDistribution.medium,

      low: severityDistribution.low,

      total: vulnerabilities.length,
    };

    const findingCounts = {};

    vulnerabilities.forEach((vuln) => {
      findingCounts[vuln.title] = (findingCounts[vuln.title] || 0) + 1;
    });

    vulnerabilities.forEach((vuln) => {
      if (vuln.owasp) {
        owaspDistribution[vuln.owasp] =
          (owaspDistribution[vuln.owasp] || 0) + 1;
      }

      if (vuln.cwe) {
        cweDistribution[vuln.cwe] = (cweDistribution[vuln.cwe] || 0) + 1;
      }
    });

    const topFindings = Object.entries(findingCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([title, count]) => ({
        title,
        count,
      }));

const latestScan = await Scan.findOne()
  .sort({ createdAt: -1 });

const criticalFindings = await Vulnerability.find({
  scanId: latestScan?._id,
})
  .sort({
    createdAt: -1,
  });


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

    res.json({
      success: true,
      stats: {
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

        securityTrend,
        activityTimeline,
        apiInventory,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
