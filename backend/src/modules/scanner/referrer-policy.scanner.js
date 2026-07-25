const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanReferrerPolicy = async (targetUrl) => {
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

    const rp = response.headers["referrer-policy"];

    if (!rp || rp.includes("unsafe-url")) {
      const finding = createFinding("WEAK_REFERRER_POLICY") || {
        title: "Weak Referrer Policy Exposure",
        severity: "LOW",
        cwe: "116",
        owasp: "API8:2023 Security Misconfiguration",
        description: `Target endpoint ${targetUrl} lacks a strict Referrer-Policy header, allowing sensitive URL path parameters to leak to third-party domains.`,
      };
      findings.push(finding);
    }
  } catch (err) {
    console.warn(`[referrer-policy-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanReferrerPolicy };
