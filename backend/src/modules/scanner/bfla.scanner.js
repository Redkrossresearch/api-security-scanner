const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanBFLA = async (targetUrl) => {
  const findings = [];
  try {
    // Probe privileged admin HTTP methods (DELETE, PUT) on standard endpoints
    const response = await axios.delete(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
        "X-User-Role": "user",
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 6000,
      validateStatus: () => true,
    });

    if (response.status === 200 || response.status === 204) {
      const finding = createFinding("BFLA_VULNERABILITY") || {
        title: "Broken Function Level Authorization (BFLA)",
        severity: "HIGH",
        cwe: "285",
        owasp: "API5:2023 Broken Function Level Authorization",
        description: `Privileged administrative method DELETE on ${targetUrl} succeeded without enforcing role-based function authorization checks.`,
      };
      findings.push(finding);
    }
  } catch (err) {
    console.warn(`[bfla-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanBFLA };
