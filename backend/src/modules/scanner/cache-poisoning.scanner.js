const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanCachePoisoning = async (targetUrl) => {
  const findings = [];
  try {
    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
        "X-Forwarded-Host": "evil-cache-poison.com",
        "X-Host": "evil-cache-poison.com",
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 6000,
      validateStatus: () => true,
    });

    const bodyText = typeof response.data === "string" ? response.data : JSON.stringify(response.data || "");
    const cacheHeader = response.headers["x-cache"] || response.headers["cf-cache-status"] || "";

    if (bodyText.includes("evil-cache-poison.com") && cacheHeader) {
      const finding = createFinding("CACHE_POISONING_EXPOSURE") || {
        title: "Unkeyed Header Web Cache Poisoning",
        severity: "HIGH",
        cwe: "444",
        owasp: "API8:2023 Security Misconfiguration",
        description: `Target endpoint ${targetUrl} reflected unkeyed HTTP header X-Forwarded-Host into cached response (${cacheHeader}).`,
      };
      findings.push(finding);
    }
  } catch (err) {
    console.warn(`[cache-poisoning-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanCachePoisoning };
