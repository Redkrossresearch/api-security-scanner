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

<div class="pdf-page">
  <div class="cover-content">
    <div class="logo">
      ATH<span>X</span> SECURITY
    </div>
    <div class="subtitle">
      Vulnerability Assessment Report
    </div>
    
    <div class="hero-card">
      <div class="hero-title">
        ${vulnerability.title}
      </div>
      <div class="hero-description">
        ${vulnerability.description || "Security vulnerability detected during assessment."}
      </div>
    </div>

    <div class="metrics">
      <div class="metric-card">
        <div class="metric-label">Severity</div>
        <div class="metric-value ${severityClass}">
          ${vulnerability.severity}
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-label">CVSS Score</div>
        <div class="metric-value">${vulnerability.cvss || "N/A"}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">CWE</div>
        <div class="metric-value">${vulnerability.cwe || "N/A"}</div>
      </div>
    </div>

    <div class="meta-section">
      <div class="meta-card">
        <div class="meta-title">Generated On</div>
        <div class="meta-value">${new Date().toLocaleString()}</div>
      </div>
      <div class="meta-card">
        <div class="meta-title">OWASP</div>
        <div class="meta-value">${vulnerability.owasp || "N/A"}</div>
      </div>
    </div>

    <div class="confidential">
      <div class="confidential-title">Confidential Security Report</div>
      <div class="confidential-text">
        This report contains sensitive security information. Distribution should be restricted to authorized personnel only.
      </div>
    </div>
  </div>
  
  <div class="footer">
    <span>ATHX Security Compliance</span>
    <span>Page 1 of 2</span>
  </div>
</div>

<div class="flow-page">
  <div class="section-title">Executive Summary</div>
  <div class="report-content">
    ${marked.parse(analysis.executiveSummary || "-")}
  </div>

  <div class="section-title">Business Impact</div>
  <div class="report-content">
    ${marked.parse(analysis.businessImpact || "-")}
  </div>

  <div class="section-title">Technical Analysis</div>
  <div class="report-content">
    ${marked.parse(analysis.technicalAnalysis || "-")}
  </div>

  <div class="section-title">Attack Scenario</div>
  <div class="report-content">
    ${marked.parse(analysis.attackScenario || "-")}
  </div>

  <div class="section-title">Remediation Plan</div>
  <div class="report-content">
    ${marked.parse(analysis.remediationPlan || "-")}
  </div>

  <div class="section-title">ATHX Security Verdict</div>
  <div class="report-content">
    ${marked.parse(analysis?.verdict?.summary || analysis?.verdict || "-")}
  </div>

  <div class="footer" style="margin-top: 40px;">
    <span>ATHX Security Compliance</span>
    <span>Page 2 of 2</span>
  </div>
</div>

</body>
</html>
`;
};

module.exports = reportTemplate;
