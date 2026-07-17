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
</head>
<body>

<div class="pdf-page">
  <div class="cover-content">
    <div class="logo">
      ATH<span>X</span> SECURITY
    </div>
    <div class="subtitle">
      Full Security Assessment Report
    </div>

    <div class="hero-card">
      <div class="hero-title" style="font-size: 32px;">
        API Scan Assessment
      </div>
      <div class="hero-description">
        <strong>Scan ID:</strong> ${report.scanId || "N/A"}<br/>
        <strong>Date Generated:</strong> ${new Date(report.createdAt || Date.now()).toLocaleString()}<br/>
        <strong>Target URL:</strong> ${report.targetUrl || "Analyzed API Target"}
      </div>
    </div>

    <div class="metrics">
      <div class="metric-card">
        <div class="metric-label">Security Score</div>
        <div class="metric-value">${report.securityScore || 0}/100</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Grade</div>
        <div class="metric-value">${report.grade || "N/A"}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Risk Level</div>
        <div class="metric-value ${riskLevelClass}">${report.riskLevel || "N/A"}</div>
      </div>
    </div>

    <div class="meta-section">
      <div class="meta-card">
        <div class="meta-title">Findings Overview</div>
        <div class="meta-value" style="font-size: 13px; line-height: 1.6;">
          Total Findings: ${report.summary?.totalFindings || 0}<br/>
          Critical: <span class="critical">${report.summary?.critical || 0}</span> |
          High: <span class="high">${report.summary?.high || 0}</span> |
          Medium: <span class="medium">${report.summary?.medium || 0}</span> |
          Low: <span class="low">${report.summary?.low || 0}</span>
        </div>
      </div>
      <div class="meta-card">
        <div class="meta-title">Assessment Engine</div>
        <div class="meta-value" style="font-size: 13px;">
          ATHX Security Intelligence Suite v1.0
        </div>
      </div>
    </div>

    <div class="confidential">
      <div class="confidential-title">Confidential Security Report</div>
      <div class="confidential-text">
        This report contains sensitive security findings and vulnerability details.
        Please restrict its access to authorized team members and engineering personnel only.
      </div>
    </div>
  </div>
  
  <div class="footer">
    <span>ATHX Security Compliance</span>
    <span>Cover Page</span>
  </div>
</div>

<div class="flow-page">
  <div class="section-title">Executive Summary</div>
  <div class="report-content">
    ${marked.parse(report.executiveSummary || "No executive summary available.")}
  </div>

  <div class="section-title">Risk Overview</div>
  <div class="report-content">
    ${marked.parse(report.riskOverview || "No risk overview available.")}
  </div>

  ${
    report.topFindings && report.topFindings.length > 0
      ? `
  <div class="section-title">Top Findings</div>
  <div class="report-content" style="margin-top: 15px;">
    ${report.topFindings
      .map((finding) => {
        const sev = finding.severity?.toLowerCase() || "info";
        return `
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <span style="font-weight: 700; font-size: 13px;">${finding.title}</span>
        <span class="badge badge-${sev}">${finding.severity}</span>
      </div>
      `;
      })
      .join("")}
  </div>
  `
      : ""
  }

  ${
    report.remediationRoadmap
      ? `
  <div class="section-title">Remediation Roadmap</div>
  <div class="report-content">
    ${
      report.remediationRoadmap.immediateActions &&
      report.remediationRoadmap.immediateActions.length > 0
        ? `
      <h3 style="margin-top: 15px; margin-bottom: 8px; color: #F87171; font-size: 14px;">Immediate Actions</h3>
      <ul>
        ${report.remediationRoadmap.immediateActions.map((act) => `<li>${act}</li>`).join("")}
      </ul>
    `
        : ""
    }

    ${
      report.remediationRoadmap.highPriorityActions &&
      report.remediationRoadmap.highPriorityActions.length > 0
        ? `
      <h3 style="margin-top: 15px; margin-bottom: 8px; color: #FB923C; font-size: 14px;">High Priority Actions</h3>
      <ul>
        ${report.remediationRoadmap.highPriorityActions.map((act) => `<li>${act}</li>`).join("")}
      </ul>
    `
        : ""
    }

    ${
      report.remediationRoadmap.mediumPriorityActions &&
      report.remediationRoadmap.mediumPriorityActions.length > 0
        ? `
      <h3 style="margin-top: 15px; margin-bottom: 8px; color: #FBBF24; font-size: 14px;">Medium Priority Actions</h3>
      <ul>
        ${report.remediationRoadmap.mediumPriorityActions.map((act) => `<li>${act}</li>`).join("")}
      </ul>
    `
        : ""
    }
  </div>
  `
      : ""
  }

  ${
    vulnerabilities && vulnerabilities.length > 0
      ? `
  <div style="page-break-before: always; margin-top: 30px;">
    <div class="section-title">Detailed Vulnerabilities List</div>
    ${vulnerabilities
      .map((v, i) => {
        const sev = v.severity?.toLowerCase() || "info";
        return `
      <div class="vuln-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h3 style="margin: 0; color: #FFF; font-size: 14px; font-weight: 800;">#${i + 1} ${v.title}</h3>
          <span class="badge badge-${sev}">${v.severity}</span>
        </div>
        <div style="font-size: 11.5px; color: #94A3B8; margin-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 8px;">
          <strong>Category:</strong> ${v.category || "General"} |
          <strong>CWE:</strong> ${v.cwe || "N/A"} |
          <strong>OWASP:</strong> ${v.owasp || "N/A"} |
          <strong>CVSS:</strong> ${v.cvss || "N/A"}
        </div>
        <div style="font-size: 12px; color: #E2E8F0; line-height: 1.6; margin-bottom: 10px;">
          <strong>Description:</strong> ${v.description || "No description provided."}
        </div>
        ${
          v.endpoint
            ? `
        <div style="font-size: 11px; color: #60A5FA; font-family: monospace; background: rgba(0, 0, 0, 0.35); padding: 8px 12px; border-radius: 6px; margin-bottom: 10px; border: 1px solid rgba(96, 165, 250, 0.15); word-break: break-all;">
          <strong>ENDPOINT:</strong> ${v.endpoint}
        </div>
        `
            : ""
        }
        ${
          v.exploitPayload
            ? `
        <div style="font-size: 11px; color: #C084FC; font-family: monospace; background: rgba(0, 0, 0, 0.35); padding: 8px 12px; border-radius: 6px; margin-bottom: 10px; border: 1px solid rgba(192, 132, 252, 0.15); word-break: break-all;">
          <strong>EXPLOIT PAYLOAD:</strong> ${v.exploitPayload}
        </div>
        `
            : ""
        }
        <div style="font-size: 12px; color: #34D399; line-height: 1.6; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.15); padding: 10px; border-radius: 8px;">
          <strong>RECOMMENDATION:</strong> ${v.recommendation || "Restrict access and validate user inputs."}
        </div>
      </div>
      `;
      })
      .join("")}
  </div>
  `
      : ""
  }

  <div class="footer" style="margin-top: 40px;">
    <span>ATHX Security Compliance Report</span>
    <span>End of Document</span>
  </div>
</div>

</body>
</html>
  `;
};

module.exports = fullReportTemplate;
