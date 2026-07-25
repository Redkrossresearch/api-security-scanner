const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanLDAPInjection = async (targetUrl) => {
  const findings = [];
  try {
    const ldapPayloads = ["*(|(objectclass=*))", "admin*)(|(password=*))"];

    for (const payload of ldapPayloads) {
      const probeUrl = `${targetUrl}${targetUrl.includes("?") ? "&" : "?"}user=${encodeURIComponent(payload)}`;

      const response = await axios.get(probeUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 5000,
        validateStatus: () => true,
      });

      const bodyText = typeof response.data === "string" ? response.data : JSON.stringify(response.data || "");

      if (bodyText.includes("LDAPException") || bodyText.includes("javax.naming.directory")) {
        const finding = createFinding("LDAP_INJECTION_VULNERABILITY") || {
          title: "LDAP Query Injection Vulnerability",
          severity: "HIGH",
          cwe: "90",
          owasp: "API8:2023 Security Misconfiguration",
          description: `Target endpoint ${targetUrl} reflected LDAP directory syntax errors when passed payload ${payload}.`,
        };
        findings.push(finding);
        break;
      }
    }
  } catch (err) {
    console.warn(`[ldap-injection-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanLDAPInjection };
