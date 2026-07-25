const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanXPathInjection = async (targetUrl) => {
  const findings = [];
  try {
    const xpathPayloads = ["' or '1'='1", "' or ''='"];

    for (const payload of xpathPayloads) {
      const probeUrl = `${targetUrl}${targetUrl.includes("?") ? "&" : "?"}query=${encodeURIComponent(payload)}`;

      const response = await axios.get(probeUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 5000,
        validateStatus: () => true,
      });

      const bodyText = typeof response.data === "string" ? response.data : JSON.stringify(response.data || "");

      if (bodyText.includes("XPathException") || bodyText.includes("DOMXPath")) {
        const finding = createFinding("XPATH_INJECTION_VULNERABILITY") || {
          title: "XPath Query Injection Vulnerability",
          severity: "HIGH",
          cwe: "643",
          owasp: "API8:2023 Security Misconfiguration",
          description: `Target endpoint ${targetUrl} generated XPath evaluation exceptions when processing unvalidated input payload ${payload}.`,
        };
        findings.push(finding);
        break;
      }
    }
  } catch (err) {
    console.warn(`[xpath-injection-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanXPathInjection };
