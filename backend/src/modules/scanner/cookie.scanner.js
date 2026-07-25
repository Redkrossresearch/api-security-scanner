const axios = require("axios");
const https = require("https");

const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanCookies = async (targetUrl) => {
  const findings = [];
  const findingKeys = new Set();

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
      validateStatus: () => true,
    });

    const headers = response.headers || {};
    const cookies = headers["set-cookie"] || [];

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
    console.warn(`[cookie-scanner] Exception during scan of ${targetUrl}:`, error.message);
  }

  return findings;
};


module.exports = {
  scanCookies,
};
