const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanClickjacking = async (targetUrl) => {
  const findings = [];
  try {
    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 8000,
      validateStatus: () => true,
    });

    const headers = response.headers || {};
    const xfo = headers["x-frame-options"];
    const csp = headers["content-security-policy"] || "";

    const hasFrameAncestors = csp.includes("frame-ancestors");
    const hasXFO = Boolean(xfo);

    if (!hasFrameAncestors && !hasXFO) {
      const finding = createFinding("MISSING_CLICKJACKING_PROTECTION");
      if (finding) {
        finding.description = `Target URL ${targetUrl} lacks both X-Frame-Options and Content-Security-Policy frame-ancestors headers, leaving it vulnerable to clickjacking.`;
        findings.push(finding);
      }
    }
  } catch (err) {
    console.warn(`[clickjacking-scanner] Exception scanning ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanClickjacking };
