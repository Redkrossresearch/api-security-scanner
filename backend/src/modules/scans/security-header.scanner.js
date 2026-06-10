const axios = require("axios");
const https = require("https");

const { createFinding, } = require("./vulnerability.factory");

const {HEADER_RULES, } = require("./header.rules");

const scanSecurityHeaders = async (
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

    const csp =
      headers[
      "content-security-policy"
      ];

    const hsts =
      headers[
      "strict-transport-security"
      ];

    const referrerPolicy =
      headers[
      "referrer-policy"
      ];

    for (const rule of HEADER_RULES) {

      if (!headers[rule.header]) {

        const finding = createFinding(rule.vulnerability);

        if (finding) {
          findings.push(finding);
        }
      }

    }

    // CSP Analysis

    if (csp) {

      if (
        csp.includes("*")
      ) {

        const finding =
          createFinding(
            "CSP_WILDCARD"
          );

        if (finding) {
          findings.push(
            finding
          );
        }

      }

      if (
        csp.includes(
          "'unsafe-inline'"
        )
      ) {

        const finding =
          createFinding(
            "UNSAFE_INLINE_CSP"
          );

        if (finding) {
          findings.push(
            finding
          );
        }

      }

      if (
        csp.includes(
          "'unsafe-eval'"
        )
      ) {

        const finding =
          createFinding(
            "UNSAFE_EVAL_CSP"
          );

        if (finding) {
          findings.push(
            finding
          );
        }

      }

    }

    // HSTS Analysis

    if (hsts) {

      const maxAgeMatch =
        hsts.match(
          /max-age=(\d+)/i
        );

      if (
        maxAgeMatch &&
        Number(
          maxAgeMatch[1]
        ) < 31536000
      ) {

        const finding =
          createFinding(
            "WEAK_HSTS_MAX_AGE"
          );

        if (finding) {
          findings.push(
            finding
          );
        }

      }

      if (
        !hsts.includes(
          "includeSubDomains"
        )
      ) {

        const finding =
          createFinding(
            "WEAK_HSTS"
          );

        if (finding) {
          findings.push(
            finding
          );
        }

      }

    }

    // Referrer Policy Analysis

    if (
      referrerPolicy &&
      (
        referrerPolicy ===
        "unsafe-url" ||

        referrerPolicy ===
        "no-referrer-when-downgrade"
      )
    ) {

      const finding =
        createFinding(
          "WEAK_REFERRER_POLICY"
        );

      if (finding) {
        findings.push(
          finding
        );
      }

    }

  } catch (error) {

    findings.push({
      title: "Header Scan Failed",
      severity: "low",
      description: error.message,
    });

  }

  return findings;
};

module.exports = {
  scanSecurityHeaders,
};