const generateNarrativeReport = (report) => {
  return {
    reportTitle: "ATHX Security Assessment Report",

    executiveSummary: report.executiveSummary,

    riskOverview: report.riskOverview,

    securityPosture: {
      score: report.securityScore,
      grade: report.grade,
      riskLevel: report.riskLevel,
    },

    findingSummary: report.summary,

    topFindings: report.topFindings?.map((finding) => ({
      title: finding.title,
      severity: finding.severity,
    })),

    owaspBreakdown: report.owaspBreakdown,

    cweBreakdown: report.cweBreakdown,

    remediationRoadmap: report.remediationRoadmap,

    recommendations: report.recommendations,

    finalVerdict: {
      securityScore: report.securityScore,

      grade: report.grade,

      riskLevel: report.riskLevel,

      summary: `The target achieved a security score of ${report.securityScore}/100 with an overall risk classification of ${report.riskLevel}. Immediate remediation of identified weaknesses is recommended to improve overall security posture and reduce exposure to common attack techniques.`,
    },

    generatedBy: "ATHX Security Intelligence",

    reportVersion: "1.0",

    reportType: "Website Security Assessment",

    generatedAt: new Date().toISOString(),
  };
};

module.exports = {
  generateNarrativeReport,
};
