const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanSSRF = async (targetUrl) => {
  const findings = [];
  try {
    const ssrfTargets = [
      "http://127.0.0.1:80",
      "http://localhost:22",
      "http://169.254.169.254/latest/meta-data/",
    ];

    for (const target of ssrfTargets) {
      const probeUrl = `${targetUrl}${targetUrl.includes("?") ? "&" : "?"}url=${encodeURIComponent(target)}&redirect=${encodeURIComponent(target)}&dest=${encodeURIComponent(target)}`;

      const response = await axios.get(probeUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 6000,
        validateStatus: () => true,
      });

      const bodyText = typeof response.data === "string" ? response.data : JSON.stringify(response.data || "");

      if (
        bodyText.includes("SSH-2.0") ||
        bodyText.includes("ami-id") ||
        bodyText.includes("localhost")
      ) {
        const finding = createFinding("SSRF_VULNERABILITY") || {
          title: "Server-Side Request Forgery (SSRF)",
          severity: "CRITICAL",
          cwe: "918",
          owasp: "API7:2023 Server Side Request Forgery",
          description: `Endpoint ${targetUrl} processed internal request loopbacks to ${target}. An attacker can bypass network perimeters and scan internal services.`,
        };
        findings.push(finding);
        break;
      }
    }
  } catch (err) {
    console.warn(`[ssrf-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanSSRF };
