const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanContentTypeSniffing = async (targetUrl) => {
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

    const xcto = response.headers["x-content-type-options"];

    if (!xcto || xcto.toLowerCase() !== "nosniff") {
      const finding = createFinding("MISSING_NOSNIFF_HEADER") || {
        title: "Missing X-Content-Type-Options Header",
        severity: "LOW",
        cwe: "693",
        owasp: "API8:2023 Security Misconfiguration",
        description: `Target endpoint ${targetUrl} lacks X-Content-Type-Options: nosniff header, permitting MIME-sniffing attacks.`,
      };
      findings.push(finding);
    }
  } catch (err) {
    console.warn(`[content-type-sniffing-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanContentTypeSniffing };
