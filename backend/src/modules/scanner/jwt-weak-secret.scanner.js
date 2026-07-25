const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanJWTWeakSecret = async (targetUrl) => {
  const findings = [];
  try {
    // Probe authorization header with alg: "none" JWT token
    const algNoneJWT = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.";

    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
        Authorization: `Bearer ${algNoneJWT}`,
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 6000,
      validateStatus: () => true,
    });

    if (response.status === 200) {
      const finding = createFinding("JWT_NONE_ALGORITHM_ACCEPTED") || {
        title: "JWT Unsigned 'alg: none' Exploitability",
        severity: "CRITICAL",
        cwe: "347",
        owasp: "API2:2023 Broken Authentication",
        description: `Target endpoint ${targetUrl} accepted an unsigned JWT token using the 'alg: none' algorithm without signature verification.`,
      };
      findings.push(finding);
    }
  } catch (err) {
    console.warn(`[jwt-weak-secret-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanJWTWeakSecret };
