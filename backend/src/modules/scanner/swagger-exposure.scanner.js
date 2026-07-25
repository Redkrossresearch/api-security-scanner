const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanSwaggerExposure = async (targetUrl) => {
  const findings = [];
  try {
    const swaggerPaths = [
      "/swagger-ui.html",
      "/swagger-ui/index.html",
      "/v2/api-docs",
      "/v3/api-docs",
      "/redoc",
    ];

    const baseUrl = targetUrl.replace(/\/+$/, "");

    for (const path of swaggerPaths) {
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

      if (response.status === 200 && (bodyText.includes("swagger") || bodyText.includes("SwaggerUI") || bodyText.includes("redoc"))) {
        const finding = createFinding("PUBLIC_SWAGGER_UI_EXPOSURE") || {
          title: `Public Interactive API Documentation (${path})`,
          severity: "MEDIUM",
          cwe: "200",
          owasp: "API9:2023 Improper Assets Management",
          description: `Interactive API documentation interface (Swagger / ReDoc) is publicly exposed at ${probeUrl} without authentication.`,
        };
        findings.push(finding);
        break;
      }
    }
  } catch (err) {
    console.warn(`[swagger-exposure-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanSwaggerExposure };
