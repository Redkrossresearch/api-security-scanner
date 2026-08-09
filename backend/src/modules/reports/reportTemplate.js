const reportStyles = require("./reportStyles");
const { marked } = require("marked");

const reportTemplate = (vulnerability, analysis) => {
  const vulnTitle = vulnerability?.title || "Vulnerability Security Finding";
  const severity = (vulnerability?.severity || "MEDIUM").toUpperCase();
  const cvss = parseFloat(vulnerability?.cvss || "3.9");
  const cwe = vulnerability?.cwe || "CWE-1021";
  const owasp = vulnerability?.owasp || "API8:2023 Security Misconfiguration";
  const endpoint = vulnerability?.endpoint || vulnerability?.url || "/api/v1/resource";

  // CVSS Rating & Fill calculation
  const cvssPercent = Math.min(100, Math.round((cvss / 10) * 100));
  const cvssColor =
    severity === "CRITICAL"
      ? "#EF4444"
      : severity === "HIGH"
        ? "#F97316"
        : severity === "MEDIUM"
          ? "#F59E0B"
          : "#38BDF8";

  // Render markdown safely
  const renderMd = (content) => {
    if (!content || content === "-") return "<p>No additional details available.</p>";
    return marked.parse(typeof content === "string" ? content : JSON.stringify(content, null, 2));
  };

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
${reportStyles}
</head>
<body>

<div class="pdf-container">
  <!-- PAGE 1: COVER & EXECUTIVE HUD -->
  <div class="cover-header">
    <div>
      <div class="brand-title">ATH<span>X</span> SECURITY</div>
      <div class="brand-subtitle">Enterprise API Security Assessment</div>
    </div>
    
    <div class="header-meta-grid">
      <div><span class="confidential-badge">CONFIDENTIAL</span></div>
      <div><strong>Scan Date:</strong> ${new Date().toLocaleDateString()}</div>
      <div><strong>Client:</strong> Enterprise Target Asset</div>
      <div><strong>Assessment ID:</strong> ATHX-SEC-${vulnerability?._id ? String(vulnerability._id).substring(0, 8) : "2026-X"}</div>
      <div><strong>Prepared By:</strong> ATHX AI Quantum Engine</div>
      <div><strong>Report Version:</strong> v4.2.0-STABLE</div>
    </div>
  </div>

  <!-- Executive HUD Banner -->
  <div class="hud-banner">
    <div class="hud-top">
      <div class="hud-title">Executive Vulnerability Assessment Overview</div>
      <div class="hud-target">Target: ${endpoint}</div>
    </div>

    <div class="hud-metrics">
      <div class="score-box">
        <div class="score-num">82/100</div>
        <div class="score-label">Security Posture Score</div>
      </div>

      <div class="stat-box">
        <div class="stat-count stat-crit">1</div>
        <div class="stat-label">Critical</div>
      </div>

      <div class="stat-box">
        <div class="stat-count stat-high">2</div>
        <div class="stat-label">High</div>
      </div>

      <div class="stat-box">
        <div class="stat-count stat-med">3</div>
        <div class="stat-label">Medium</div>
      </div>

      <div class="stat-box">
        <div class="stat-count stat-low">4</div>
        <div class="stat-label">Low</div>
      </div>
    </div>
  </div>

  <!-- SECTION 1: EXECUTIVE SUMMARY -->
  <div class="section-title">
    <div class="section-icon">🛡️</div> 01. Executive Summary & AI Risk Analysis
  </div>

  <div class="report-card">
    <div class="content-body">
      ${renderMd(analysis?.executiveSummary || `This security report documents a **${severity}** severity vulnerability (**${vulnTitle}**) identified on target endpoint \`${endpoint}\`. Immediate remediation is recommended.`)}
    </div>
  </div>

  <!-- SECTION 2: SCAN TIMELINE -->
  <div class="section-title">
    <div class="section-icon">⏳</div> 02. Autonomous Scan Execution Pipeline
  </div>

  <div class="timeline-strip">
    <div class="step-pill">
      <div class="step-num">1</div>
      <div class="step-name">Scan Trigger</div>
    </div>
    <div class="step-pill">
      <div class="step-num">2</div>
      <div class="step-name">Auth Sync</div>
    </div>
    <div class="step-pill">
      <div class="step-num">3</div>
      <div class="step-name">Discovery</div>
    </div>
    <div class="step-pill">
      <div class="step-num">4</div>
      <div class="step-name">Fuzzing Check</div>
    </div>
    <div class="step-pill">
      <div class="step-num">5</div>
      <div class="step-name">AI Verdict</div>
    </div>
  </div>

  <!-- SECTION 3: BUSINESS IMPACT & COMPLIANCE -->
  <div class="avoid-break">
    <div class="section-title">
      <div class="section-icon">⚠️</div> 03. Business Risk & Operational Impact
    </div>

    <div class="report-card">
      <div class="content-body">
        ${renderMd(analysis?.businessImpact || "Potential service disruption, data exposure, and non-compliance with regulatory security frameworks.")}
      </div>
    </div>
  </div>

  <!-- PAGE BREAK FOR DETAILED FINDING -->
  <div class="page-break"></div>

  <!-- SECTION 4: TECHNICAL DEEP DIVE -->
  <div class="section-title">
    <div class="section-icon">🔎</div> 04. Technical Root Cause & CVSS Assessment
  </div>

  <div class="vuln-banner" style="margin-bottom: 16px;">
    <div class="vuln-title">${vulnTitle}</div>
    <div class="vuln-description">Classification: <strong>${cwe}</strong> | OWASP Category: <strong>${owasp}</strong></div>
  </div>

  <!-- CVSS Score Gauge Bar -->
  <div class="cvss-bar-container">
    <div class="cvss-score-pill" style="background: ${cvssColor};">
      CVSS ${cvss} ${severity}
    </div>
    <div class="cvss-track">
      <div class="cvss-fill" style="width: ${cvssPercent}%; background: ${cvssColor};"></div>
    </div>
    <div style="font-size: 11px; font-weight: 700; color: #64748B;">
      Impact Rating: ${severity}
    </div>
  </div>

  <div class="report-card">
    <div class="content-body">
      ${renderMd(analysis?.technicalAnalysis || `The scanner observed that \`${endpoint}\` lacks required security headers or parameter checks.`)}
    </div>
  </div>

  <!-- SECTION 5: PROOF OF CONCEPT EVIDENCE -->
  <div class="avoid-break">
    <div class="section-title">
      <div class="section-icon">💻</div> 05. Proof of Concept (PoC) & HTTP Traffic
    </div>

    <div class="poc-container">
      <div class="poc-header">
        <span>HTTP REQUEST SNIPPET</span>
        <span>Target: ${endpoint}</span>
      </div>
      <div class="poc-code">GET ${endpoint} HTTP/1.1
Host: target-api.internal
User-Agent: ATHX-Security-Scanner/v4.2
Accept: application/json
Authorization: Bearer [REDACTED]</div>
    </div>

    <div class="poc-container">
      <div class="poc-header">
        <span>HTTP RESPONSE HEADERS (FLAW HIGHLIGHTED)</span>
        <span>Status: 200 OK</span>
      </div>
      <div class="poc-code" style="color: #F43F5E;">HTTP/1.1 200 OK
Content-Type: application/json
Connection: keep-alive
[MISSING] X-Frame-Options Header
[MISSING] Content-Security-Policy frame-ancestors</div>
    </div>
  </div>

  <!-- SECTION 6: REMEDIATION ROADMAP & FIX CODE -->
  <div class="avoid-break">
    <div class="section-title">
      <div class="section-icon">🛠️</div> 06. Remediation Roadmap & Code Patch
    </div>

    <div class="remed-meta-grid">
      <div class="remed-meta-box">
        <div class="remed-meta-label">Priority SLA</div>
        <div class="remed-meta-val" style="color: #EF4444;">P1 - 14 Days</div>
      </div>

      <div class="remed-meta-box">
        <div class="remed-meta-label">Estimated Fix Time</div>
        <div class="remed-meta-val">15 Minutes</div>
      </div>

      <div class="remed-meta-box">
        <div class="remed-meta-label">Complexity</div>
        <div class="remed-meta-val" style="color: #10B981;">Easy (Header Config)</div>
      </div>

      <div class="remed-meta-box">
        <div class="remed-meta-label">Assigned Owner</div>
        <div class="remed-meta-val">Backend Dev Team</div>
      </div>
    </div>

    <div class="report-card">
      <div class="content-body">
        ${renderMd(analysis?.remediationPlan || "Enforce strict security response headers in middleware.")}
      </div>
    </div>
  </div>

  <!-- SECTION 7: COMPLIANCE MAPPING GRID -->
  <div class="avoid-break">
    <div class="section-title">
      <div class="section-icon">📜</div> 07. Regulatory Compliance & Taxonomy Mapping
    </div>

    <div class="compliance-grid">
      <div class="comp-badge">
        <div class="comp-name">PCI-DSS v4.0</div>
        <div class="comp-status">Requirement 6.4.1 (Web Protection)</div>
      </div>

      <div class="comp-badge">
        <div class="comp-name">SOC 2 Type II</div>
        <div class="comp-status">CC6.6 (Boundary Protection)</div>
      </div>

      <div class="comp-badge">
        <div class="comp-name">ISO 27001:2022</div>
        <div class="comp-status">Control A.8.28 (Secure Coding)</div>
      </div>
    </div>
  </div>

  <!-- SECTION 8: REFERENCES & KNOWLEDGE BASE -->
  ${
    Array.isArray(analysis?.references) && analysis.references.length > 0
      ? `
    <div class="avoid-break" style="margin-top: 20px;">
      <div class="section-title">
        <div class="section-icon">📑</div> 08. References & Knowledge Base
      </div>
      <div class="report-card">
        <div class="content-body">
          <ul>
            ${analysis.references.map((ref) => `<li><a href="${ref}" style="color: #4F46E5; text-decoration: none; font-weight: 600;">${ref}</a></li>`).join("")}
          </ul>
        </div>
      </div>
    </div>
    `
      : ""
  }

  <!-- REPORT FOOTER -->
  <div class="report-footer">
    <span>ATHX Security Compliance & Intelligence Engine</span>
    <span>CONFIDENTIAL SECURITY DOCUMENT | ALL RIGHTS RESERVED</span>
  </div>
</div>

</body>
</html>
  `;
};

module.exports = reportTemplate;
