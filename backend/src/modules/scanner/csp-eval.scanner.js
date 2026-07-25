const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanCSPEval = async (targetUrl) => {
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

    const csp = response.headers["content-security-policy"] || "";

    if (csp.includes("unsafe-eval") || csp.includes("unsafe-inline")) {
      const finding = createFinding("WEAK_CSP_POLICY") || {
        title: "Content Security Policy (CSP) Bypass Vector",
        severity: "MEDIUM",
        cwe: "1021",
        owasp: "API8:2023 Security Misconfiguration",
        description: `Content Security Policy header on ${targetUrl} contains 'unsafe-eval' or 'unsafe-inline' directives, reducing XSS mitigation effectiveness.`,
      };
      findings.push(finding);
    }
  } catch (err) {
    console.warn(`[csp-eval-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanCSPEval };
