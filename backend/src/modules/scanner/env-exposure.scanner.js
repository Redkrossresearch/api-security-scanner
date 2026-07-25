const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanEnvExposure = async (targetUrl) => {
  const findings = [];
  try {
    const envPaths = ["/.env", "/.env.local", "/.env.production", "/config.env"];
    const baseUrl = targetUrl.replace(/\/+$/, "");

    for (const path of envPaths) {
      const probeUrl = `${baseUrl}${path}`;

      const response = await axios.get(probeUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 5000,
        validateStatus: () => true,
      });

      const bodyText = typeof response.data === "string" ? response.data : JSON.stringify(response.data || "");

      if (
        response.status === 200 &&
        (bodyText.includes("DB_PASSWORD") ||
          bodyText.includes("DATABASE_URL") ||
          bodyText.includes("SECRET_KEY") ||
          bodyText.includes("AWS_ACCESS_KEY"))
      ) {
        const finding = createFinding("PUBLIC_ENV_FILE_EXPOSURE") || {
          title: "Public Environment Secret File (.env) Exposure",
          severity: "CRITICAL",
          cwe: "538",
          owasp: "API8:2023 Security Misconfiguration",
          description: `Exposed environment secret configuration file (.env) discovered at ${probeUrl} containing plain-text database credentials or API keys.`,
        };
        findings.push(finding);
        break;
      }
    }
  } catch (err) {
    console.warn(`[env-exposure-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanEnvExposure };
