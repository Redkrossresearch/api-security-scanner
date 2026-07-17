const axios = require("axios");

const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanRateLimit = async (targetUrl) => {
  const findings = [];

  try {
    const requests = [];

    for (let i = 0; i < 25; i++) {
      requests.push(
        axios.get(targetUrl, {
          timeout: 5000,
          validateStatus: () => true,
        }),
      );
    }

    const responses = await Promise.allSettled(requests);

    let rateLimitedResponses = 0;
    let retryAfterFound = false;

    responses.forEach((result) => {
      if (result.status !== "fulfilled") {
        return;
      }

      const response = result.value;

      if (response.status === 429) {
        rateLimitedResponses++;

        if (response.headers["retry-after"]) {
          retryAfterFound = true;
        }
      }
    });

    if (rateLimitedResponses === 0) {
      const finding = createFinding("RATE_LIMIT_MISSING");

      if (finding) {
        findings.push(finding);
      }
    }

    if (rateLimitedResponses > 0 && rateLimitedResponses < 3) {
      const finding = createFinding("WEAK_RATE_LIMIT");

      if (finding) {
        findings.push(finding);
      }
    }

    if (rateLimitedResponses > 0 && !retryAfterFound) {
      const finding = createFinding("NO_RETRY_AFTER_HEADER");

      if (finding) {
        findings.push(finding);
      }
    }
  } catch (error) {
    console.error("Rate Limit Scanner Error:", error.message);
  }

  return findings;
};

module.exports = {
  scanRateLimit,
};
