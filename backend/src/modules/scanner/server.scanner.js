const axios = require("axios");
const https = require("https");

const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanServerDisclosure = async (targetUrl) => {
  const findings = [];

  try {
    const response = await axios.get(targetUrl, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      timeout: 10000,
    });

    const headers = response.headers;

    if (headers["server"]) {
      const finding = createFinding("SERVER_DISCLOSURE");

      if (finding) {
        finding.description = `Server header exposed: ${headers["server"]}`;

        findings.push(finding);
      }
    }

    if (headers["x-powered-by"]) {
      const finding = createFinding("TECHNOLOGY_DISCLOSURE");

      if (finding) {
        finding.description = `X-Powered-By exposed: ${headers["x-powered-by"]}`;

        findings.push(finding);
      }
    }

    if (headers["x-aspnet-version"]) {
      const finding = createFinding("ASPNET_VERSION_DISCLOSURE");

      if (finding) {
        finding.description = `ASP.NET version exposed: ${headers["x-aspnet-version"]}`;

        findings.push(finding);
      }
    }
  } catch (error) {
    findings.push({
      title: "Server Scan Failed",
      severity: "low",
      description: error.message,
    });
  }

  return findings;
};

module.exports = {
  scanServerDisclosure,
};
