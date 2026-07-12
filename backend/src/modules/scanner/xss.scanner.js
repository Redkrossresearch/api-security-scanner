const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const XSS_PAYLOADS = [
  "<script>alert(1)</script>",
  "<img src=x onerror=alert(1)>",
  "\"><script>alert(1)</script>",
  "javascript:alert(1)",
  "<svg onload=alert(1)>",
  "'-alert(1)-'",
  "\"-alert(1)-\"",
  "</script><script>alert(1)</script>",
];

const scanXSS = async (targetUrl) => {
  const findings = [];

  try {
    const url = new URL(targetUrl);
    const baseUrl = `${url.protocol}//${url.host}`;

    const testPaths = [
      url.pathname,
      "/search",
      "/api/search",
      "/query",
      "/api/query",
      "/feedback",
      "/contact",
      "/api/v1/search",
    ];

    const uniquePaths = [...new Set(testPaths)];
    const paramsToTest = ["q", "query", "search", "name", "keyword", "term", "input", "message"];

    for (const path of uniquePaths.slice(0, 3)) {
      const testUrl = `${baseUrl}${path}`;

      for (const param of paramsToTest.slice(0, 4)) {
        for (const payload of XSS_PAYLOADS.slice(0, 3)) {
          try {
            const response = await axios.get(testUrl, {
              params: { [param]: payload },
              timeout: 8000,
              validateStatus: () => true,
              httpsAgent: new https.Agent({ rejectUnauthorized: false }),
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              },
            });

            const body = typeof response.data === "string" ? response.data : JSON.stringify(response.data);

            if (body.includes(payload)) {
              const finding = createFinding("REFLECTED_XSS");
              if (finding) {
                finding.endpoint = `${testUrl}?${param}=${encodeURIComponent(payload)}`;
                finding.verified = true;
                finding.evidence = `XSS payload reflected in response on parameter '${param}'`;
                finding.exploitPayload = payload;
                finding.vulnerableParameter = param;
                finding.evidenceSnippet = body.substring(0, 300);
                findings.push(finding);
              }
              break;
            }
          } catch {
            continue;
          }
        }
      }
    }
  } catch {
    return findings;
  }

  return findings;
};

module.exports = {
  scanXSS,
};
