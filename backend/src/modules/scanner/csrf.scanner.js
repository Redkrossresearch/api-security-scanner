const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanCSRF = async (targetUrl) => {
  const findings = [];
  try {
    const urlObj = new URL(targetUrl);
    const originUrl = `${urlObj.protocol}//${urlObj.hostname}`;

    // Test state-changing POST request with untrusted Origin header
    const response = await axios.post(
      targetUrl,
      { test: "csrf_probe" },
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
          "Content-Type": "application/json",
          Origin: "https://evil-attacker-domain.com",
          Referer: "https://evil-attacker-domain.com/attack.html",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 8000,
        validateStatus: () => true,
      }
    );

    const headers = response.headers || {};
    const setCookie = headers["set-cookie"] || [];
    const cookieStr = Array.isArray(setCookie) ? setCookie.join("; ") : String(setCookie);

    // Check if state-changing request accepted untrusted origin without anti-CSRF token or SameSite protection
    const acceptedUntrustedOrigin = response.status >= 200 && response.status < 300;
    const hasSameSite = cookieStr.toLowerCase().includes("samesite=");

    if (acceptedUntrustedOrigin && !hasSameSite) {
      const finding = createFinding("CSRF_VULNERABILITY") || {
        title: "Cross-Site Request Forgery (CSRF) Exposure",
        severity: "HIGH",
        cwe: "352",
        owasp: "API8:2023 Security Misconfiguration",
        description: `Target state-changing endpoint ${targetUrl} processed POST requests originating from untrusted origin (evil-attacker-domain.com) without SameSite cookie protection or mandatory anti-CSRF tokens.`,
      };
      findings.push(finding);
    }
  } catch (err) {
    console.warn(`[csrf-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanCSRF };
