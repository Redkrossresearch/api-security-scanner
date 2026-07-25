const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanWebSockets = async (targetUrl) => {
  const findings = [];
  try {
    const wsUrl = targetUrl.replace(/^http/, "ws");

    // Test HTTP Upgrade header response on target endpoint
    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
        Upgrade: "websocket",
        Connection: "Upgrade",
        "Sec-WebSocket-Key": "dGhlIHNhbXBsZSBub25jZQ==",
        "Sec-WebSocket-Version": "13",
        Origin: "https://untrusted-evil-site.com",
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 7000,
      validateStatus: () => true,
    });

    // Check if server returns 101 Switching Protocols to untrusted origin without authorization check
    if (response.status === 101) {
      const finding = createFinding("WEBSOCKET_ORIGIN_HIJACKING") || {
        title: "Cross-Site WebSocket Hijacking (CSWSH)",
        severity: "HIGH",
        cwe: "1385",
        owasp: "API8:2023 Security Misconfiguration",
        description: `WebSocket endpoint ${wsUrl} accepted WebSocket protocol upgrade requests originating from untrusted origin (untrusted-evil-site.com). Attackers can hijack real-time WebSocket feeds via malicious websites.`,
      };
      findings.push(finding);
    }
  } catch (err) {
    console.warn(`[websockets-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanWebSockets };
