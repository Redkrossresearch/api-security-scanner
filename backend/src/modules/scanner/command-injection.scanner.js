const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const CMD_INJECTION_PAYLOADS = [
  "; echo INJECTED",
  "| echo INJECTED",
  "`echo INJECTED`",
  "$(echo INJECTED)",
  "; ping -c 1 127.0.0.1",
  "| whoami",
  "; whoami",
  "& whoami",
  "&& whoami",
  "| ping -n 1 127.0.0.1",
];

const CMD_OUTPUT_PATTERNS = [
  /INJECTED/i,
  /^root$/im,
  /^admin$/im,
  /^nt authority/im,
  /uid=\d+/i,
  /gid=\d+/i,
  /groups=\d+/i,
  /Microsoft Windows/i,
  /Volume in drive/i,
  /Directory of/i,
];

const scanCommandInjection = async (targetUrl) => {
  const findings = [];

  try {
    const url = new URL(targetUrl);
    const baseUrl = `${url.protocol}//${url.host}`;

    const testPaths = [
      url.pathname,
      "/ping",
      "/api/ping",
      "/api/v1/ping",
      "/exec",
      "/api/exec",
      "/api/run",
      "/cmd",
      "/api/cmd",
      "/api/utils/ping",
    ];

    const uniquePaths = [...new Set(testPaths)];
    const paramsToTest = ["ip", "host", "hostname", "domain", "cmd", "command", "exec", "ping", "addr", "target"];

    for (const path of uniquePaths.slice(0, 3)) {
      const testUrl = `${baseUrl}${path}`;

      for (const param of paramsToTest.slice(0, 4)) {
        for (const payload of CMD_INJECTION_PAYLOADS.slice(0, 3)) {
          try {
            const response = await axios.get(testUrl, {
              params: { [param]: payload },
              timeout: 10000,
              validateStatus: () => true,
              httpsAgent: new https.Agent({ rejectUnauthorized: false }),
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              },
              responseType: "text",
            });

            const body = typeof response.data === "string" ? response.data : JSON.stringify(response.data);

            for (const pattern of CMD_OUTPUT_PATTERNS) {
              if (pattern.test(body)) {
                const finding = createFinding("COMMAND_INJECTION");
                if (finding) {
                  finding.endpoint = `${testUrl}?${param}=${encodeURIComponent(payload)}`;
                  finding.verified = true;
                  finding.evidence = `Command injection detected on parameter '${param}' with payload: ${payload}`;
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
  scanCommandInjection,
};
