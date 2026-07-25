const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanProtoPollution = async (targetUrl) => {
  const findings = [];
  try {
    const payload = {
      "__proto__": {
        "polluted": "true"
      },
      "constructor": {
        "prototype": {
          "polluted": "true"
        }
      }
    };

    const response = await axios.post(targetUrl, payload, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
        "Content-Type": "application/json",
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 6000,
      validateStatus: () => true,
    });

    const bodyText = typeof response.data === "string" ? response.data : JSON.stringify(response.data || "");

    if (bodyText.includes("polluted") || (response.data && response.data.polluted)) {
      const finding = createFinding("PROTOTYPE_POLLUTION_VULNERABILITY") || {
        title: "JavaScript Prototype Pollution Vulnerability",
        severity: "HIGH",
        cwe: "1321",
        owasp: "API8:2023 Security Misconfiguration",
        description: `Target endpoint ${targetUrl} accepted prototype mutation attributes (__proto__ / constructor.prototype), modifying global object prototypes.`,
      };
      findings.push(finding);
    }
  } catch (err) {
    console.warn(`[proto-pollution-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanProtoPollution };
