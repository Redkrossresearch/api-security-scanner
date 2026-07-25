const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanRedisExposure = async (targetUrl) => {
  const findings = [];
  try {
    const urlObj = new URL(targetUrl);
    const host = urlObj.hostname;

    // Test Redis default port 6379 HTTP wrapper probing
    const probeUrl = `${urlObj.protocol}//${host}:6379/`;

    const response = await axios.get(probeUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 4000,
      validateStatus: () => true,
    });

    const bodyText = typeof response.data === "string" ? response.data : JSON.stringify(response.data || "");

    if (bodyText.includes("-ERR wrong number of arguments") || bodyText.includes("redis_version")) {
      const finding = createFinding("UNAUTHENTICATED_REDIS_EXPOSURE") || {
        title: "Unauthenticated Redis Database Exposure (Port 6379)",
        severity: "CRITICAL",
        cwe: "306",
        owasp: "API8:2023 Security Misconfiguration",
        description: `Unauthenticated Redis instance discovered listening publicly on host ${host}:6379. Attackers can dump cache keys and execute remote code.`,
      };
      findings.push(finding);
    }
  } catch (err) {
    console.warn(`[redis-exposure-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanRedisExposure };
