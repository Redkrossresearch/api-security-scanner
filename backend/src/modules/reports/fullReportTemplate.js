const reportStyles = require("./reportStyles");
const { marked } = require("marked");

const fullReportTemplate = (report, vulnerabilities = []) => {
  const riskLevelClass = report.riskLevel?.toLowerCase() || "medium";

  return `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8" />
${reportStyles}
<style>
  .finding-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  .finding-title {
    font-weight: 600;
  }
  .finding-severity {
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .severity-badge-critical { background: rgba(239, 68, 68, 0.2); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.4); }
  .severity-badge-high { background: rgba(249, 115, 22, 0.2); color: #F97316; border: 1px solid rgba(249, 115, 22, 0.4); }
  .severity-badge-medium { background: rgba(234, 179, 8, 0.2); color: #EAB308; border: 1px solid rgba(234, 179, 8, 0.4); }
  .severity-badge-low { background: rgba(59, 130, 246, 0.2); color: #3B82F6; border: 1px solid rgba(59, 130, 246, 0.4); }
  .severity-badge-info { background: rgba(156, 163, 175, 0.2); color: #9CA3AF; border: 1px solid rgba(156, 163, 175, 0.4); }
</style>
</head>

<body>

<div class="page">

  <div class="cover-header">

    <div class="logo">
      ATH<span>X</span> SECURITY
    </div>

    <div class="subtitle">
      Full Security Assessment Report
    </div>

  </div>

  <div class="hero-card">

    <div class="hero-title" style="font-size: 40px;">
      API Scan Assessment
    </div>

    <div class="hero-description">
      Scan ID: ${report.scanId || "N/A"}<br/>
      Date Generated: ${new Date(report.createdAt || Date.now()).toLocaleString()}<br/>
      Target URL: ${report.targetUrl || "Analyzed API Target"}
    </div>

  </div>

  <div class="metrics">

    <div class="metric-card">
      <div class="metric-label">
        Security Score
      </div>

      <div class="metric-value">
        ${report.securityScore || 0}/100
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-label">
        Grade
      </div>

      <div class="metric-value">
        ${report.grade || "N/A"}
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-label">
        Risk Level
      </div>

      <div class="metric-value ${riskLevelClass}">
        ${report.riskLevel || "N/A"}
      </div>
    </div>

  </div>

  <div class="meta-section">

    <div class="meta-card">
      <div class="meta-title">
        Findings Overview
      </div>

      <div class="meta-value" style="font-size: 16px; line-height: 1.6;">
        Total Findings: ${report.summary?.totalFindings || 0}<br/>
        Critical: <span class="critical">${report.summary?.critical || 0}</span> |
        High: <span class="high">${report.summary?.high || 0}</span> |
        Medium: <span class="medium">${report.summary?.medium || 0}</span> |
        Low: <span class="low">${report.summary?.low || 0}</span>
      </div>
    </div>

    <div class="meta-card">
      <div class="meta-title">
        Assessment Engine
      </div>

      <div class="meta-value" style="font-size: 16px;">
        ATHX Security Intelligence Suite v1.0
      </div>
    </div>

  </div>

  <div class="confidential">

    <div class="confidential-title">
      Confidential Security Report
    </div>

    <div class="confidential-text">
      This report contains sensitive security findings and vulnerability details.
      Please restrict its access to authorized team members and engineering personnel only.
    </div>

  </div>

</div>

<div class="page-break"></div>

<div class="report-page">

  <h1>Executive Summary</h1>

  <div class="report-content">
    ${marked.parse(report.executiveSummary || "No executive summary available.")}
  </div>

  <h1>Risk Overview</h1>

  <div class="report-content">
    ${marked.parse(report.riskOverview || "No risk overview available.")}
  </div>

  ${report.topFindings && report.topFindings.length > 0 ? `
  <h1>Top Findings</h1>

  <div class="report-content" style="margin-top: 20px;">
    ${report.topFindings.map(finding => {
      const sev = finding.severity?.toLowerCase() || "info";
      return `
      <div class="finding-row">
        <span class="finding-title">${finding.title}</span>
        <span class="finding-severity severity-badge-${sev}">${finding.severity}</span>
      </div>
      `;
    }).join("")}
  </div>
  ` : ""}

  ${report.remediationRoadmap ? `
  <h1>Remediation Roadmap</h1>

  <div class="report-content">
    ${report.remediationRoadmap.immediateActions && report.remediationRoadmap.immediateActions.length > 0 ? `
      <h3>Immediate Actions</h3>
      <ul>
        ${report.remediationRoadmap.immediateActions.map(act => `<li>${act}</li>`).join("")}
      </ul>
    ` : ""}

    ${report.remediationRoadmap.highPriorityActions && report.remediationRoadmap.highPriorityActions.length > 0 ? `
      <h3>High Priority Actions</h3>
      <ul>
        ${report.remediationRoadmap.highPriorityActions.map(act => `<li>${act}</li>`).join("")}
      </ul>
    ` : ""}

    ${report.remediationRoadmap.mediumPriorityActions && report.remediationRoadmap.mediumPriorityActions.length > 0 ? `
      <h3>Medium Priority Actions</h3>
      <ul>
        ${report.remediationRoadmap.mediumPriorityActions.map(act => `<li>${act}</li>`).join("")}
      </ul>
    ` : ""}
  </div>
  ` : ""}

  ${vulnerabilities && vulnerabilities.length > 0 ? `
  <div class="page-break"></div>
  <div class="report-page">
    <h1>Detailed Vulnerabilities List</h1>
    ${vulnerabilities.map((v, i) => {
      const sev = v.severity?.toLowerCase() || "info";
      return `
      <div style="margin-bottom: 25px; padding: 15px; border: 1px solid rgba(255, 255, 255, 0.05); background: rgba(255, 255, 255, 0.02); border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 style="margin: 0; color: #fff; font-size: 16px;">#${i + 1} ${v.title}</h3>
          <span class="finding-severity severity-badge-${sev}">${v.severity}</span>
        </div>
        <div style="font-size: 13px; color: rgba(255, 255, 255, 0.6); margin-bottom: 8px;">
          <strong>Category:</strong> ${v.category || "General"} |
          <strong>CWE:</strong> ${v.cwe || "N/A"} |
          <strong>OWASP:</strong> ${v.owasp || "N/A"} |
          <strong>CVSS:</strong> ${v.cvss || "N/A"}
        </div>
        <div style="font-size: 13px; color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin-bottom: 8px;">
          <strong>Description:</strong> ${v.description || "No description provided."}
        </div>
        ${v.endpoint ? `
        <div style="font-size: 13px; color: rgba(255, 255, 255, 0.8); font-family: monospace; background: rgba(0, 0, 0, 0.2); padding: 6px 10px; border-radius: 4px; margin-bottom: 8px; word-break: break-all;">
          <strong>Endpoint:</strong> ${v.endpoint}
        </div>
        ` : ""}
        ${v.exploitPayload ? `
        <div style="font-size: 13px; color: rgba(255, 255, 255, 0.8); font-family: monospace; background: rgba(0, 0, 0, 0.2); padding: 6px 10px; border-radius: 4px; margin-bottom: 8px; word-break: break-all;">
          <strong>Exploit Payload:</strong> ${v.exploitPayload}
        </div>
        ` : ""}
        <div style="font-size: 13px; color: #10B981; line-height: 1.6;">
          <strong>Recommendation:</strong> ${v.recommendation || "Restrict access and validate user inputs."}
        </div>
      </div>
      `;
    }).join("")}
  </div>
  ` : ""}

</div>

</body>
</html>
  `;
};

module.exports = fullReportTemplate;
