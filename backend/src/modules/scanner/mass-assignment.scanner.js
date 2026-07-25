const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanMassAssignment = async (targetUrl) => {
  const findings = [];
  try {
    const payload = {
      is_admin: true,
      role: "administrator",
      admin: 1,
      access_level: "root",
    };

    const response = await axios.post(targetUrl, payload, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
        "Content-Type": "application/json",
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 6000,
      validateStatus: () => true,
    });

    const bodyText = typeof response.data === "string" ? response.data : JSON.stringify(response.data || "");

    if (bodyText.includes("is_admin") || bodyText.includes("administrator") || bodyText.includes("access_level")) {
      const finding = createFinding("MASS_ASSIGNMENT_VULNERABILITY") || {
        title: "Mass Assignment / Parameter Pollution",
        severity: "HIGH",
        cwe: "915",
        owasp: "API6:2023 Unrestricted Access to Sensitive Business Flows",
        description: `Target endpoint ${targetUrl} bound sensitive internal properties (is_admin / role: administrator) passed directly in request body JSON payload.`,
      };
      findings.push(finding);
    }
  } catch (err) {
    console.warn(`[mass-assignment-scanner] Error probing ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanMassAssignment };
