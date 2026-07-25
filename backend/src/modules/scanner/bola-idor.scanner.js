const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanBOLA = async (targetUrl) => {
  const findings = [];
  try {
    // If target ends with numerical ID, probe adjacent object IDs
    if (/\/\d+$/.test(targetUrl)) {
      const altUrl = targetUrl.replace(/\/\d+$/, "/105");

      const response = await axios.get(altUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
          Authorization: "Bearer invalid_or_other_user_token",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 6000,
        validateStatus: () => true,
      });

      if (response.status === 200 && response.data) {
        const finding = createFinding("BOLA_IDOR_EXPOSURE") || {
          title: "Broken Object Level Authorization (BOLA / IDOR)",
          severity: "CRITICAL",
          cwe: "284",
          owasp: "API1:2023 Broken Object Level Authorization",
          description: `Target endpoint ${altUrl} returned object data (200 OK) without validating object-level ownership authorization.`,
        };
        findings.push(finding);
      }
    }
  } catch (err) {
    console.warn(`[bola-idor-scanner] Error probing ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanBOLA };
