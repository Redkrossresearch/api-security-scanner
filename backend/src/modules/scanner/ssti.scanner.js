const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanSSTI = async (targetUrl) => {
  const findings = [];
  try {
    const sstiPayloads = ["{{7*7}}", "${7*7}", "<%= 7*7 %>", "#{7*7}"];

    for (const payload of sstiPayloads) {
      const probeUrl = `${targetUrl}${targetUrl.includes("?") ? "&" : "?"}template=${encodeURIComponent(payload)}&name=${encodeURIComponent(payload)}`;

      const response = await axios.get(probeUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 6000,
        validateStatus: () => true,
      });

      const bodyText = typeof response.data === "string" ? response.data : JSON.stringify(response.data || "");

      if (bodyText.includes("49")) {
        const finding = createFinding("SSTI_VULNERABILITY") || {
          title: "Server-Side Template Injection (SSTI)",
          severity: "CRITICAL",
          cwe: "1336",
          owasp: "API8:2023 Security Misconfiguration",
          description: `Target endpoint ${targetUrl} evaluated template expression payload ${payload} to 49. Attackers can execute arbitrary code on the server.`,
        };
        findings.push(finding);
        break;
      }
    }
  } catch (err) {
    console.warn(`[ssti-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanSSTI };
