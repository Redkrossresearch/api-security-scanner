const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const SQLI_PAYLOADS = [
  "' OR '1'='1",
  "' OR 1=1 --",
  "' UNION SELECT NULL--",
  "'; DROP TABLE users--",
  "' AND SLEEP(5)--",
  "' OR '1'='1' --",
  "1' ORDER BY 1--",
  "1' ORDER BY 100--",
  "' UNION SELECT 1,2,3--",
  "admin' --",
];

const SQL_ERROR_PATTERNS = [
  /SQL syntax.*MySQL/i,
  /Warning.*mysql_.*:/i,
  /MySqlException/i,
  /valid MySQL result/i,
  /PostgreSQL.*ERROR/i,
  /Warning.*\Wpg_.*:/i,
  /valid PostgreSQL result/i,
  /Npgsql\./i,
  /SQLite\/JDBC/i,
  /SQLite\.Exception/i,
  /System\.Data\.SQLite\./i,
  /Warning.*sqlite_.*:/i,
  /valid SQLite/i,
  /SQL Server.*Driver/i,
  /Driver.*SQL Server/i,
  /SQLServer JDBC Driver/i,
  /com\.microsoft\.sqlserver/i,
  /Unclosed quotation mark/i,
  /Incorrect syntax near/i,
  /OLE DB.*SQL Server/i,
  /ORA-[0-9]{5}/i,
  /Oracle.*Driver/i,
  /oracle\.jdbc/i,
  /quoted string not properly terminated/i,
  /division by zero.*SQL/i,
  /Unknown column.*in 'field list'/i,
  /Table.*doesn't exist/i,
  /You have an error in your SQL syntax/i,
];

const scanSQLi = async (targetUrl) => {
  const findings = [];

  try {
    const url = new URL(targetUrl);
    const baseUrl = `${url.protocol}//${url.host}`;

    const testPaths = [
      url.pathname,
      "/search",
      "/api/users",
      "/api/v1/users",
      "/login",
      "/api/login",
      "/api/items",
      "/products",
    ];

    const uniquePaths = [...new Set(testPaths)];
    const paramsToTest = ["id", "q", "query", "user", "name", "page", "limit", "sort", "filter", "search"];

    for (const path of uniquePaths.slice(0, 3)) {
      const testUrl = `${baseUrl}${path}`;

      for (const param of paramsToTest.slice(0, 4)) {
        for (const payload of SQLI_PAYLOADS.slice(0, 3)) {
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

            for (const pattern of SQL_ERROR_PATTERNS) {
              if (pattern.test(body)) {
                const finding = createFinding("SQL_INJECTION");
                if (finding) {
                  finding.endpoint = `${testUrl}?${param}=${encodeURIComponent(payload)}`;
                  finding.verified = true;
                  finding.evidence = `SQL error pattern matched on parameter '${param}' with payload: ${payload}`;
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
  scanSQLi,
};
