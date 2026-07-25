const axios = require("axios");
const https = require("https");

const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanCORS = async (targetUrl) => {
  const findings = [];

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "*/*",
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: () => true, // Don't throw on 301, 401, 403, 404
    });

    const headers = response.headers || {};
    const origin = headers["access-control-allow-origin"];
    const credentials = headers["access-control-allow-credentials"];

    if (!origin) {
      return findings;
    }

    if (origin.toLowerCase() === "null") {
      const finding = createFinding("DANGEROUS_CORS_CONFIGURATION");
      if (finding) findings.push(finding);
    }

    if (origin === "*") {
      const finding = createFinding("WILDCARD_CORS");
      if (finding) findings.push(finding);
    }

    if (origin === "*" && credentials?.toLowerCase() === "true") {
      const finding = createFinding("DANGEROUS_CORS_CONFIGURATION");
      if (finding) findings.push(finding);
    }
  } catch (error) {
    console.warn(`[cors-scanner] Exception during scan of ${targetUrl}:`, error.message);
  }

  return findings;
};


module.exports = {
  scanCORS,
};
