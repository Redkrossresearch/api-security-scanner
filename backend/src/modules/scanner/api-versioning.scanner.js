const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanApiVersioning = async (targetUrl) => {
  const findings = [];
  try {
    // Test for deprecated API version paths (e.g. /v1/ when target is /v2/)
    if (targetUrl.includes("/v2/") || targetUrl.includes("/v3/")) {
      const v1Url = targetUrl.replace(/\/v[23]\//, "/v1/");

      const response = await axios.get(v1Url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 5000,
        validateStatus: () => true,
      });

      if (response.status === 200) {
        const finding = createFinding("DEPRECATED_API_VERSION_EXPOSURE") || {
          title: "Deprecated Legacy API Version Exposure (/v1/)",
          severity: "MEDIUM",
          cwe: "1059",
          owasp: "API9:2023 Improper Assets Management",
          description: `Deprecated legacy API endpoint ${v1Url} remains active without security patches or deprecation warnings.`,
        };
        findings.push(finding);
      }
    }
  } catch (err) {
    console.warn(`[api-versioning-scanner] Error probing ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanApiVersioning };
