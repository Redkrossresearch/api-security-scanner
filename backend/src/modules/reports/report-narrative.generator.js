const generateExecutiveSummary = (scan, findings) => {
  const critical = findings.filter((f) => f.severity === "critical").length;

  const high = findings.filter((f) => f.severity === "high").length;

  const medium = findings.filter((f) => f.severity === "medium").length;

  const low = findings.filter((f) => f.severity === "low").length;

  return `
The ATHX Security Scanner assessment identified ${findings.length} security findings affecting the target application, including ${critical} critical, ${high} high-risk, ${medium} medium-risk and ${low} low-risk observations.

The overall security score was calculated as ${scan.securityScore}/100, resulting in a ${scan.riskLevel} risk classification and a grade of ${scan.grade}.

The assessment identified ${critical} critical findings, ${high} high-risk findings, ${medium} medium-risk findings and ${low} low-risk findings.

Organizations should prioritize remediation of critical and high-risk findings to reduce the likelihood of security incidents, unauthorized access, service disruption and data exposure.
`.trim();
};

const generateRiskOverview = (scan) => {
  if (scan.riskLevel === "Critical") {
    return `
The assessment identified security weaknesses that may significantly increase the likelihood of unauthorized access, service disruption, data compromise and regulatory compliance concerns.

Immediate remediation is strongly recommended.
`.trim();
  }

  if (scan.riskLevel === "High") {
    return `
The assessment identified multiple high-risk security issues that could adversely affect the confidentiality, integrity and availability of application resources.

Timely remediation should be prioritized.
`.trim();
  }

  if (scan.riskLevel === "Medium") {
    return `
The assessment identified several security weaknesses that may increase exposure to common attack techniques and operational risks.

Remediation should be scheduled according to organizational risk priorities.
`.trim();
  }

  return `
The assessment identified a limited number of security concerns and the overall security posture appears relatively mature.

Continuous monitoring and periodic validation remain recommended.
`.trim();
};

const generateRemediationRoadmap = (findings) => {
  const criticalAndHigh = findings.filter(
    (f) => f.severity === "critical" || f.severity === "high",
  );

  const medium = findings.filter((f) => f.severity === "medium");

  const low = findings.filter((f) => f.severity === "low");

  return {
    immediateActions: criticalAndHigh.slice(0, 5).map((f) => f.recommendation),

    highPriorityActions: medium.slice(0, 5).map((f) => f.recommendation),

    mediumPriorityActions: low.slice(0, 5).map((f) => f.recommendation),

    longTermImprovements: [
      "Implement continuous security monitoring.",
      "Perform periodic security assessments.",
      "Establish secure development lifecycle practices.",
      "Integrate automated security testing into deployment pipelines.",
    ],
  };
};

module.exports = {
  generateExecutiveSummary,
  generateRiskOverview,
  generateRemediationRoadmap,
};
