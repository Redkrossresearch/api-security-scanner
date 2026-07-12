const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const TRAVERSAL_PAYLOADS = [
  "../../../../etc/passwd",
  "../../../../etc/shadow",
  "../../../../windows/win.ini",
  "../../../../etc/issue",
  "..\\..\\..\\..\\windows\\win.ini",
  "../../../../etc/hosts",
  "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc/passwd",
  "../../../../etc/nginx/nginx.conf",
  "../../../../../etc/apache2/apache2.conf",
  "....//....//....//etc/passwd",
];

const SENSITIVE_CONTENT_PATTERNS = [
  /root:.*:0:0:/i,
  /\[fonts\]/i,
  /\[extensions\]/i,
  /Microsoft Windows/i,
  /for 16-bit app support/i,
  /127\.0\.0\.1/i,
  /localhost/i,
  /server_name/i,
  /listen\s+\d+/i,
  /Welcome to nginx/i,
];

const scanPathTraversal = async (targetUrl) => {
  const findings = [];

  try {
    const url = new URL(targetUrl);
    const baseUrl = `${url.protocol}//${url.host}`;

    const testPaths = [
      url.pathname,
      "/download",
      "/api/download",
      "/file",
      "/api/file",
      "/view",
      "/api/v1/files",
      "/static",
      "/assets",
      "/images",
    ];

    const uniquePaths = [...new Set(testPaths)];
    const paramsToTest = ["file", "path", "download", "filename", "name", "template", "view", "page", "load", "doc"];

    for (const path of uniquePaths.slice(0, 3)) {
      const testUrl = `${baseUrl}${path}`;

      for (const param of paramsToTest.slice(0, 4)) {
        for (const payload of TRAVERSAL_PAYLOADS.slice(0, 3)) {
          try {
            const response = await axios.get(testUrl, {
              params: { [param]: payload },
              timeout: 8000,
              validateStatus: () => true,
              httpsAgent: new https.Agent({ rejectUnauthorized: false }),
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              },
              responseType: "text",
            });

            const body = typeof response.data === "string" ? response.data : JSON.stringify(response.data);

            for (const pattern of SENSITIVE_CONTENT_PATTERNS) {
              if (pattern.test(body)) {
                const finding = createFinding("PATH_TRAVERSAL");
                if (finding) {
                  finding.endpoint = `${testUrl}?${param}=${encodeURIComponent(payload)}`;
                  finding.verified = true;
                  finding.evidence = `Path traversal successful on parameter '${param}' with payload: ${payload}`;
                  finding.exploitPayload = payload;
                  finding.vulnerableParameter = param;
                  finding.evidenceSnippet = body.substring(0, 300);
                  findings.push(finding);
                }
                break;
              }
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
  scanPathTraversal,
};
