const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanOpenRedirect = async (targetUrl) => {
  const findings = [];
  try {
    const redirectPayloads = [
      "https://evil-attacker-site.com",
      "//evil-attacker-site.com",
      "/\\evil-attacker-site.com",
    ];

    for (const payload of redirectPayloads) {
      const probeUrl = `${targetUrl}${targetUrl.includes("?") ? "&" : "?"}url=${encodeURIComponent(payload)}&redirect=${encodeURIComponent(payload)}&next=${encodeURIComponent(payload)}`;

      const response = await axios.get(probeUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 6000,
        maxRedirects: 0,
        validateStatus: () => true,
      });

      const location = response.headers["location"] || "";

      if (location.includes("evil-attacker-site.com") || response.status === 302 || response.status === 301) {
        const finding = createFinding("OPEN_REDIRECT_EXPOSURE") || {
          title: "Open Redirect Vulnerability",
          severity: "MEDIUM",
          cwe: "601",
          owasp: "API7:2023 Server Side Request Forgery",
          description: `Endpoint ${targetUrl} redirected user session to external untrusted domain (${location}) via unvalidated redirect parameters.`,
        };
        findings.push(finding);
        break;
      }
    }
  } catch (err) {
    console.warn(`[open-redirect-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanOpenRedirect };
