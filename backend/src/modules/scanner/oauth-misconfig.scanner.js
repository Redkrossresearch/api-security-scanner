const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanOAuthMisconfig = async (targetUrl) => {
  const findings = [];
  try {
    const probeUrl = `${targetUrl}${targetUrl.includes("?") ? "&" : "?"}redirect_uri=https://evil-attacker-site.com/callback&response_type=code`;

    const response = await axios.get(probeUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 7000,
      maxRedirects: 0,
      validateStatus: () => true,
    });

    const locationHeader = response.headers["location"] || "";

    if (locationHeader.includes("evil-attacker-site.com") || response.status === 302) {
      const finding = createFinding("OAUTH_REDIRECT_URI_MANIPULATION") || {
        title: "OAuth 2.0 Open Redirect & Token Theft Exposure",
        severity: "HIGH",
        cwe: "601",
        owasp: "API7:2023 Server Side Request Forgery",
        description: `OAuth authorization endpoint ${targetUrl} allowed redirect_uri parameter manipulation to an external untrusted domain (evil-attacker-site.com). Attackers can hijack OAuth authorization codes and access tokens.`,
      };
      findings.push(finding);
    }
  } catch (err) {
    console.warn(`[oauth-misconfig-scanner] Error probing ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanOAuthMisconfig };
