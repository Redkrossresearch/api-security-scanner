const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanHTTPSmuggling = async (targetUrl) => {
  const findings = [];
  try {
    // Send conflicting Content-Length and Transfer-Encoding headers to detect HTTP request smuggling
    const response = await axios.post(
      targetUrl,
      "0\r\n\r\nG",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
          "Content-Length": "6",
          "Transfer-Encoding": "chunked",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 6000,
        validateStatus: () => true,
      }
    );

    if (response.status === 400 || response.status === 502) {
      // Proxy discrepancy indicated
    } else if (response.status === 200 && response.headers["x-cache-lookup"]) {
      const finding = createFinding("HTTP_REQUEST_SMUGGLING") || {
        title: "HTTP Request Smuggling Exposure",
        severity: "HIGH",
        cwe: "444",
        owasp: "API8:2023 Security Misconfiguration",
        description: `Target backend frontend proxy discrepancy detected when processing dual Content-Length and Transfer-Encoding headers on ${targetUrl}.`,
      };
      findings.push(finding);
    }
  } catch (err) {
    console.warn(`[http-smuggling-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanHTTPSmuggling };
