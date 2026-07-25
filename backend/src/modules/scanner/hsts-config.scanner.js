const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanHSTSConfig = async (targetUrl) => {
  const findings = [];
  try {
    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 6000,
      validateStatus: () => true,
    });

    const hsts = response.headers["strict-transport-security"];

    if (!hsts) {
      const finding = createFinding("MISSING_HSTS_HEADER") || {
        title: "Missing Strict-Transport-Security (HSTS) Header",
        severity: "MEDIUM",
        cwe: "523",
        owasp: "API8:2023 Security Misconfiguration",
        description: `Target HTTPS endpoint ${targetUrl} lacks Strict-Transport-Security header, leaving connections susceptible to SSL stripping MITM attacks.`,
      };
      findings.push(finding);
    }
  } catch (err) {
    console.warn(`[hsts-config-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanHSTSConfig };
