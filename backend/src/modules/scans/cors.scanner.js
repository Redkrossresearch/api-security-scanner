const axios = require("axios");
const https = require("https");

const { createFinding, } = require("./vulnerability.factory");

const scanCORS = async (
  targetUrl
) => {
  const findings = [];

  try {
    const response =
      await axios.get(
        targetUrl,
        {
          httpsAgent:
            new https.Agent({
              rejectUnauthorized: false,
            }),
          timeout: 10000,
        }
      );

    const headers =
      response.headers;

    const origin =
      headers[
      "access-control-allow-origin"
      ];

    const credentials =
      headers[
      "access-control-allow-credentials"
      ];

if (!origin) {
  return findings;
}

    if (origin === "*") {
      const finding =
        createFinding(
          "WILDCARD_CORS"
        );

      if (finding) {
        findings.push(
          finding
        );
      }
    }

    if (
      origin === "*" &&
      credentials?.toLowerCase() === "true"
    ) {
      const finding =
        createFinding(
          "DANGEROUS_CORS_CONFIGURATION"
        );

      if (finding) {
        findings.push(
          finding
        );
      }
    }

  } catch (error) {
    findings.push({
      title:
        "CORS Scan Failed",
      severity: "low",
      description:
        error.message,
    });
  }

  return findings;
};

module.exports = {
  scanCORS,
};