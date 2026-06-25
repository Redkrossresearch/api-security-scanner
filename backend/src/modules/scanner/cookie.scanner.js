const axios = require("axios");
const https = require("https");

const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanCookies = async (targetUrl) => {
  const findings = [];
  const findingKeys = new Set();

  try {
    const response = await axios.get(targetUrl, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      timeout: 10000,
    });

    const cookies = response.headers["set-cookie"] || [];

    cookies.forEach((cookie) => {
      if (!cookie.includes("Secure")) {
        findingKeys.add("COOKIE_MISSING_SECURE");
      }

      if (!cookie.includes("HttpOnly")) {
        findingKeys.add("COOKIE_MISSING_HTTPONLY");
      }

      if (!cookie.includes("SameSite")) {
        findingKeys.add("COOKIE_MISSING_SAMESITE");
      }
    });

    findingKeys.forEach((key) => {
      const finding = createFinding(key);

      if (finding) {
        findings.push(finding);
      }
    });
  } catch (error) {
    findings.push({
      title: "Cookie Scan Failed",
      severity: "low",
      description: error.message,
    });
  }

  return findings;
};

module.exports = {
  scanCookies,
};
