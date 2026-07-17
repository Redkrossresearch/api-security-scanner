const reportStyles = `
<style>
@page {
  size: A4;
  margin: 0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 210mm;
  background-color: #040B18 !important;
  color: #FFFFFF !important;
  font-family: 'Inter', -apple-system, sans-serif;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

.pdf-page {
  width: 210mm;
  height: 297mm;
  padding: 20mm;
  background: radial-gradient(circle at top right, #1e1b4b, #040b18 70%) !important;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  page-break-after: always;
  page-break-inside: avoid;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.flow-page {
  width: 210mm;
  min-height: 297mm;
  padding: 20mm;
  background: #040B18 !important;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

.cover-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 80%;
}

.logo {
  font-size: 42px;
  font-weight: 900;
  letter-spacing: 6px;
  text-transform: uppercase;
  color: #FFFFFF;
}

.logo span {
  color: #8B5CF6;
}

.subtitle {
  margin-top: 10px;
  color: #A78BFA;
  font-size: 16px;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: 700;
}

.hero-card {
  margin-top: 50px;
  border-radius: 20px;
  padding: 30px;
  border: 1.5px solid rgba(139, 92, 246, 0.3);
  background: rgba(17, 24, 39, 0.8) !important;
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.15);
}

.hero-title {
  font-size: 28px;
  font-weight: 800;
  color: #FFFFFF;
}

.hero-description {
  margin-top: 15px;
  color: #94A3B8;
  font-size: 14px;
  line-height: 1.6;
}

.metrics {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.metric-card {
  padding: 20px;
  border-radius: 14px;
  background: rgba(30, 41, 59, 0.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.metric-label {
  color: #94A3B8;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.metric-value {
  font-size: 22px;
  font-weight: 800;
}

.critical { color: #F87171; }
.high { color: #FB923C; }
.medium { color: #FBBF24; }
.low { color: #60A5FA; }

.meta-section {
  margin-top: 30px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.meta-card {
  padding: 16px;
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.meta-title {
  color: #94A3B8;
  font-size: 11px;
  font-weight: 700;
}

.meta-value {
  margin-top: 4px;
  font-size: 14px;
  color: #E2E8F0;
}

.confidential {
  margin-top: 40px;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  background: rgba(139, 92, 246, 0.05) !important;
}

.confidential-title {
  color: #A78BFA;
  font-size: 15px;
  font-weight: 800;
}

.confidential-text {
  margin-top: 6px;
  color: #94A3B8;
  font-size: 12px;
  line-height: 1.5;
}

.section-title {
  margin-top: 30px;
  margin-bottom: 15px;
  color: #C084FC;
  font-size: 20px;
  font-weight: 800;
  border-left: 4px solid #A78BFA;
  padding-left: 12px;
}

.report-content {
  color: #E2E8F0;
  font-size: 13px;
  line-height: 1.8;
}

.report-content p {
  margin-bottom: 12px;
}

.report-content ul {
  margin-left: 20px;
  margin-top: 6px;
  margin-bottom: 12px;
}

.report-content li {
  margin-bottom: 6px;
}

.report-content strong {
  color: #FFFFFF;
}

.footer {
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #94A3B8;
  font-size: 10px;
}

.vuln-card {
  margin-bottom: 20px;
  padding: 20px;
  border: 1.5px solid rgba(255, 255, 255, 0.05);
  background: rgba(30, 41, 59, 0.2) !important;
  border-radius: 12px;
  page-break-inside: avoid;
}

.badge {
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 4px;
}

.badge-critical { background: rgba(239, 68, 68, 0.15); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.35); }
.badge-high { background: rgba(249, 115, 22, 0.15); color: #FB923C; border: 1px solid rgba(249, 115, 22, 0.35); }
.badge-medium { background: rgba(234, 179, 8, 0.15); color: #FBBF24; border: 1px solid rgba(234, 179, 8, 0.35); }
.badge-low { background: rgba(59, 130, 246, 0.15); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.35); }
.badge-info { background: rgba(156, 163, 175, 0.15); color: #9CA3AF; border: 1px solid rgba(156, 163, 175, 0.35); }

</style>
`;

module.exports = reportStyles;
