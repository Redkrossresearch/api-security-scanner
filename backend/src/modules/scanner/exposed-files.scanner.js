const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const SENSITIVE_PATHS = [
  "/.env",
  "/.env.local",
  "/.env.production",
  "/.git/config",
  "/.git/HEAD",
  "/.gitignore",
  "/.htaccess",
  "/admin/",
  "/backup/",
  "/backup.sql",
  "/config.json",
  "/config.php",
  "/config.xml",
  "/config.yml",
  "/config.yaml",
  "/database.yml",
  "/db.sql",
  "/dump.sql",
  "/error.log",
  "/info.php",
  "/install/",
  "/logs/",
  "/package.json",
  "/phpinfo.php",
  "/robots.txt",
  "/sftp-config.json",
  "/sql/",
  "/ssh/",
  "/swagger.json",
  "/test/",
  "/wp-admin/",
  "/wp-config.php",
  "/wp-content/",
];

const SENSITIVE_CONTENT_PATTERNS = [
  /DB_HOST|DB_PASSWORD|DB_USERNAME|DB_DATABASE/i,
  /AWS_SECRET|AWS_ACCESS_KEY|AWS_SECRET_KEY/i,
  /SECRET_KEY|SECRET|API_KEY|API_SECRET/i,
  /password\s*[:=]/i,
  /-----BEGIN RSA PRIVATE KEY-----/i,
  /-----BEGIN OPENSSH PRIVATE KEY-----/i,
  /-----BEGIN DSA PRIVATE KEY-----/i,
  /storageBucket|storage_class/i,
  /smtp_host|smtp_user|smtp_pass/i,
  /JWT_SECRET|jwt_secret/i,
  /refs\/heads\//i,
  /repositoryformatversion/i,
];

const scanExposedFiles = async (targetUrl) => {
  const findings = [];

  try {
    const url = new URL(targetUrl);
    const baseUrl = `${url.protocol}//${url.host}`;

    for (const path of SENSITIVE_PATHS) {
      try {
        const testUrl = `${baseUrl}${path}`;
        const response = await axios.get(testUrl, {
          timeout: 8000,
          validateStatus: () => true,
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          responseType: "text",
        });

        if (
          response.status === 200 &&
          typeof response.data === "string" &&
          response.data.length > 0
        ) {
          const body = response.data;
          let matchedPattern = false;

          for (const pattern of SENSITIVE_CONTENT_PATTERNS) {
            if (pattern.test(body)) {
              matchedPattern = true;
              break;
            }
          }

          if (
            matchedPattern ||
            path.includes(".env") ||
            path.includes("config") ||
            path.includes("secret") ||
            path.includes("backup") ||
            path.includes("dump") ||
            path.includes("key") ||
            path.includes("credential") ||
            path.includes("password")
          ) {
            let findingKey = "EXPOSED_ENV_FILE";
            if (path.includes(".git")) {
              findingKey = "EXPOSED_GIT_DIRECTORY";
            } else if (
              path.includes("backup") ||
              path.includes("sql") ||
              path.includes("dump")
            ) {
              findingKey = "EXPOSED_BACKUP_FILES";
            } else if (path.includes("admin") || path.includes("wp-admin")) {
              findingKey = "EXPOSED_ADMIN_PANEL";
            } else if (
              path.includes("config") ||
              path.includes("xml") ||
              path.includes("yml") ||
              path.includes("yaml") ||
              path.includes("json") ||
              path.includes("php")
            ) {
              findingKey = "EXPOSED_CONFIGURATION_FILES";
            } else if (path.includes("log")) {
              findingKey = "EXPOSED_LOG_FILES";
            }

            const finding = createFinding(findingKey);
            if (finding) {
              finding.endpoint = testUrl;
              finding.verified = true;
              finding.evidence = `Sensitive file exposed at: ${testUrl}`;
              finding.exploitPayload = `GET ${path}`;
              finding.vulnerableParameter = "route path";
              finding.evidenceSnippet = body.substring(0, 300);
              findings.push(finding);
            }
          }
        }
      } catch {
        continue;
      }
    }
  } catch {
    return findings;
  }

  return findings;
};

module.exports = {
  scanExposedFiles,
};
