const {
  generateExecutiveSummary,
  generateRiskOverview,
  generateRemediationRoadmap,
} = require("./report-narrative.generator");

const generateReport = (scan, findings) => {
  const summary = {
    totalFindings: findings.length,

    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  const owaspBreakdown = {};

  const cweBreakdown = {};

  const topFindings = findings
    .filter((finding) => finding.severity !== "info")
    .sort((a, b) => {
      const severityRank = {
        critical: 5,
        high: 4,
        medium: 3,
        low: 2,
        info: 1,
      };

      return severityRank[b.severity] - severityRank[a.severity];
    })
    .slice(0, 5)
    .map((finding) => ({
      title: finding.title,

      severity: finding.severity,
    }));

  const recommendations = findings
    .filter((finding) => finding.recommendation)
    .map((finding) => finding.recommendation);

  const uniqueRecommendations = [...new Set(recommendations)].slice(0, 10);

  findings.forEach((finding) => {
    if (summary[finding.severity] !== undefined) {
      summary[finding.severity]++;
    }

    if (finding.owasp) {
      owaspBreakdown[finding.owasp] = (owaspBreakdown[finding.owasp] || 0) + 1;
    }

    if (finding.cwe) {
      cweBreakdown[finding.cwe] = (cweBreakdown[finding.cwe] || 0) + 1;
    }
  });

  const executiveSummary = generateExecutiveSummary(scan, findings);

  const riskOverview = generateRiskOverview(scan);

  const remediationRoadmap = generateRemediationRoadmap(findings);

  return {
    scanId: scan._id,

    securityScore: scan.securityScore,

    grade: scan.grade,

    riskLevel: scan.riskLevel,

    executiveSummary,

    riskOverview,

    remediationRoadmap,

    summary,

    topFindings,

    recommendations: uniqueRecommendations,

    owaspBreakdown,

    cweBreakdown,
  };
};

module.exports = {
  generateReport,
};
