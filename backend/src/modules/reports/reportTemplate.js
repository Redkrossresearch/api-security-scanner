const reportStyles = require("./reportStyles");
const { marked } = require("marked");
const reportTemplate = (vulnerability, analysis) => {
  const severityClass = vulnerability?.severity?.toLowerCase() || "medium";

  return `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8" />
${reportStyles}
</head>

<body>

<div class="page">

  <div class="cover-header">

    <div class="logo">
      ATH<span>X</span> SECURITY
    </div>

    <div class="subtitle">
      Vulnerability Assessment Report
    </div>

  </div>

  <div class="hero-card">

    <div class="hero-title">
      ${vulnerability.title}
    </div>

    <div class="hero-description">
      ${
        vulnerability.description ||
        "Security vulnerability detected during assessment."
      }
    </div>

  </div>

  <div class="metrics">

    <div class="metric-card">
      <div class="metric-label">
        Severity
      </div>

      <div class="metric-value ${severityClass}">
        ${vulnerability.severity}
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-label">
        CVSS Score
      </div>

      <div class="metric-value">
        ${vulnerability.cvss || "N/A"}
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-label">
        CWE
      </div>

      <div class="metric-value">
        ${vulnerability.cwe || "N/A"}
      </div>
    </div>

  </div>

  <div class="meta-section">

    <div class="meta-card">
      <div class="meta-title">
        Generated On
      </div>

      <div class="meta-value">
        ${new Date().toLocaleString()}
      </div>
    </div>

    <div class="meta-card">
      <div class="meta-title">
        OWASP
      </div>

      <div class="meta-value">
        ${vulnerability.owasp || "N/A"}
      </div>
    </div>

  </div>

  <div class="confidential">

    <div class="confidential-title">
      Confidential Security Report
    </div>

    <div class="confidential-text">
      This report contains sensitive security information.
      Distribution should be restricted to authorized
      personnel only.
    </div>

  </div>

</div>

<div class="page-break"></div>

<div class="report-page">

  <h1>Executive Summary</h1>

  <div class="report-content">
    ${marked.parse(analysis.executiveSummary || "-")}
  </div>

  <h1>Business Impact</h1>

  <div class="report-content">
    ${marked.parse(analysis.businessImpact || "-")}
  </div>

  <h1>Technical Analysis</h1>

  <div class="report-content">
    ${marked.parse(analysis.technicalAnalysis || "-")}
  </div>

  <h1>Attack Scenario</h1>

  <div class="report-content">
    ${marked.parse(analysis.attackScenario || "-")}
  </div>

  <h1>Remediation Plan</h1>

  <div class="report-content">
    ${marked.parse(analysis.remediationPlan || "-")}
  </div>

  <h1>ATHX Security Verdict</h1>

  <div class="report-content">
    ${marked.parse(analysis?.verdict?.summary || analysis?.verdict || "-")}
  </div>

</div>

</body>
</html>
`;
};

module.exports = reportTemplate;
