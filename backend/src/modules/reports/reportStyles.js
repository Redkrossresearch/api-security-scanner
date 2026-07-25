const reportStyles = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');

@page {
  size: A4;
  margin: 15mm 16mm 16mm 16mm;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 210mm;
  background-color: #FFFFFF !important;
  color: #0F172A !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  font-size: 12px;
  line-height: 1.6;
}

.pdf-container {
  width: 100%;
}

/* Page Break Controls */
.page-break {
  page-break-before: always !important;
  break-before: always !important;
}

.avoid-break {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}

h1, h2, h3, h4, .section-title {
  page-break-after: avoid !important;
  break-after: avoid !important;
}

/* Page 1 Cover & Enterprise Header */
.cover-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 3px solid #6366F1;
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.brand-title {
  font-size: 26px;
  font-weight: 900;
  color: #0F172A;
  letter-spacing: -0.5px;
}

.brand-title span {
  color: #6366F1;
}

.brand-subtitle {
  font-size: 11px;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 2px;
}

.header-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px 16px;
  font-size: 10.5px;
  text-align: right;
  color: #475569;
}

.header-meta-grid strong {
  color: #0F172A;
}

.confidential-badge {
  display: inline-block;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 4px;
}

/* Executive HUD Banner */
.hud-banner {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%) !important;
  border-radius: 16px;
  padding: 24px;
  color: #FFFFFF;
  margin-bottom: 24px;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.15);
}

.hud-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 14px;
}

.hud-title {
  font-size: 20px;
  font-weight: 800;
  color: #FFFFFF;
}

.hud-target {
  font-size: 11px;
  color: #94A3B8;
  background: rgba(255, 255, 255, 0.08);
  padding: 3px 10px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
}

.hud-metrics {
  display: grid;
  grid-template-columns: 1.2fr repeat(4, 1fr);
  gap: 12px;
  align-items: center;
}

.score-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px;
  text-align: center;
}

.score-num {
  font-size: 28px;
  font-weight: 900;
  color: #38BDF8;
  line-height: 1;
}

.score-label {
  font-size: 9.5px;
  font-weight: 700;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-top: 4px;
}

.stat-box {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 10px 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.stat-count {
  font-size: 18px;
  font-weight: 800;
}

.stat-label {
  font-size: 9px;
  font-weight: 700;
  color: #94A3B8;
  text-transform: uppercase;
  margin-top: 2px;
}

.stat-crit { color: #EF4444; }
.stat-high { color: #F97316; }
.stat-med { color: #F59E0B; }
.stat-low { color: #38BDF8; }

/* Section Title Headers */
.section-title {
  font-size: 16px;
  font-weight: 800;
  color: #0F172A;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 2px solid #E2E8F0;
  padding-bottom: 8px;
  margin-top: 24px;
  margin-bottom: 14px;
}

.section-icon {
  width: 24px;
  height: 24px;
  background: #EEF2FF;
  border: 1px solid #C7D2FE;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4F46E5;
  font-size: 13px;
}

/* Section Body & Card Containers */
.report-card {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 18px;
}

/* Timeline Container */
.timeline-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin: 16px 0;
}

.step-pill {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  position: relative;
}

.step-num {
  width: 18px;
  height: 18px;
  background: #6366F1;
  color: #FFFFFF;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.step-name {
  font-size: 10px;
  font-weight: 700;
  color: #1E293B;
}

/* Dynamic CVSS Score Bar */
.cvss-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.cvss-score-pill {
  font-size: 16px;
  font-weight: 900;
  padding: 4px 12px;
  border-radius: 6px;
  color: #FFFFFF;
}

.cvss-track {
  flex: 1;
  height: 10px;
  background: #E2E8F0;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}

.cvss-fill {
  height: 100%;
  border-radius: 999px;
}

/* Actionable Remediation Metadata Grid */
.remed-meta-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin: 14px 0;
}

.remed-meta-box {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 10px;
}

.remed-meta-label {
  font-size: 9px;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
}

.remed-meta-val {
  font-size: 12px;
  font-weight: 800;
  color: #0F172A;
  margin-top: 2px;
}

/* HTTP Request / Response Proof of Concept Terminal */
.poc-container {
  background: #0F172A !important;
  border: 1px solid #1E293B;
  border-radius: 10px;
  overflow: hidden;
  margin: 14px 0;
}

.poc-header {
  background: #1E293B;
  padding: 8px 14px;
  color: #94A3B8;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.poc-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #38BDF8;
  padding: 12px 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}

/* Modern Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  background: #FFFFFF;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #E2E8F0;
}

th {
  background: #F1F5F9;
  color: #475569;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
  padding: 9px 12px;
  border-bottom: 1px solid #E2E8F0;
}

td {
  padding: 9px 12px;
  border-bottom: 1px solid #F1F5F9;
  color: #334155;
  font-size: 11px;
}

tr:nth-child(even) {
  background: #F8FAFC;
}

/* Compliance Badges */
.compliance-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 12px;
}

.comp-badge {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 10px;
}

.comp-name {
  font-size: 10px;
  font-weight: 800;
  color: #6366F1;
}

.comp-status {
  font-size: 11px;
  color: #334155;
  margin-top: 2px;
}

/* Footer Bar */
.report-footer {
  margin-top: 30px;
  padding-top: 12px;
  border-top: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  color: #94A3B8;
  font-size: 9.5px;
}
</style>
`;

module.exports = reportStyles;
