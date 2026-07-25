const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanCORSNullOrigin = async (targetUrl) => {
  const findings = [];
  try {
    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
        Origin: "null",
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 6000,
      validateStatus: () => true,
    });

    const acao = response.headers["access-control-allow-origin"];
    const acac = response.headers["access-control-allow-credentials"];

    if (acao === "null" && acac === "true") {
      const finding = createFinding("CORS_NULL_ORIGIN_EXPOSURE") || {
        title: "CORS Null Origin & Credentials Exposure",
        severity: "HIGH",
        cwe: "942",
        owasp: "API8:2023 Security Misconfiguration",
        description: `Target endpoint ${targetUrl} reflected Access-Control-Allow-Origin: null with Access-Control-Allow-Credentials: true, allowing sandboxed iframe exploits to steal session tokens.`,
      };
      findings.push(finding);
    }
  } catch (err) {
    console.warn(`[cors-null-origin-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanCORSNullOrigin };
