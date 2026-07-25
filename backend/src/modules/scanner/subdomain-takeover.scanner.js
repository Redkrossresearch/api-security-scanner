const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanSubdomainTakeover = async (targetUrl) => {
  const findings = [];
  try {
    const urlObj = new URL(targetUrl);
    const host = urlObj.hostname;

    // Common takeover signatures in response bodies for unattached CNAMEs
    const takeoverSignatures = [
      { provider: "GitHub Pages", pattern: "There isn't a GitHub Pages site here." },
      { provider: "AWS S3", pattern: "The specified bucket does not exist" },
      { provider: "Heroku", pattern: "Heroku | No such app" },
      { provider: "Shopify", pattern: "Sorry, this shop is currently unavailable." },
      { provider: "Zendesk", pattern: "Help Center Closed" },
      { provider: "Fastly", pattern: "Fastly error: unknown domain" },
    ];

    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 8000,
      validateStatus: () => true,
    });

    const bodyText = typeof response.data === "string" ? response.data : JSON.stringify(response.data || "");

    for (const sig of takeoverSignatures) {
      if (bodyText.includes(sig.pattern)) {
        const finding = createFinding("SUBDOMAIN_TAKEOVER_EXPOSURE") || {
          title: `Potential Subdomain Takeover (${sig.provider})`,
          severity: "HIGH",
          cwe: "284",
          owasp: "API7:2023 Server Side Request Forgery",
          description: `Target host ${host} points to an unclaimed ${sig.provider} domain endpoint returning "${sig.pattern}". An attacker could claim this third-party resource and takeover the subdomain.`,
        };
        findings.push(finding);
        break;
      }
    }
  } catch (err) {
    console.warn(`[subdomain-takeover-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanSubdomainTakeover };
