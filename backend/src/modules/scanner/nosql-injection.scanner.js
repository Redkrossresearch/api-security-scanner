const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanNoSQLInjection = async (targetUrl) => {
  const findings = [];
  try {
    const nosqlPayloads = [
      { username: { "$gt": "" }, password: { "$gt": "" } },
      { username: { "$ne": null }, password: { "$ne": null } },
      { id: { "$regex": ".*" } },
    ];

    for (const payload of nosqlPayloads) {
      const response = await axios.post(targetUrl, payload, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
          "Content-Type": "application/json",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 7000,
        validateStatus: () => true,
      });

      const bodyText = typeof response.data === "string" ? response.data : JSON.stringify(response.data || "");

      if (
        (response.status === 200 && (bodyText.includes("token") || bodyText.includes("user") || bodyText.includes("success"))) ||
        bodyText.includes("MongoError") ||
        bodyText.includes("MongoServerError") ||
        bodyText.includes("$gt")
      ) {
        const finding = createFinding("NOSQL_INJECTION_VULNERABILITY") || {
          title: "NoSQL Operator Injection Vulnerability",
          severity: "CRITICAL",
          cwe: "943",
          owasp: "API8:2023 Security Misconfiguration",
          description: `Target endpoint ${targetUrl} accepted unvalidated MongoDB query operators ($gt / $ne). An attacker can bypass authentication or extract entire database collections.`,
        };
        findings.push(finding);
        break;
      }
    }
  } catch (err) {
    console.warn(`[nosql-injection-scanner] Error probing ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanNoSQLInjection };
