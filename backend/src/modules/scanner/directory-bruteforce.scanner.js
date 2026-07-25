const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanDirectoryBruteforce = async (targetUrl) => {
  const findings = [];
  try {
    const sensitivePaths = [
      "/admin",
      "/backup.zip",
      "/config.json",
      "/.git/HEAD",
      "/.env",
      "/phpinfo.php",
    ];

    const baseUrl = targetUrl.replace(/\/+$/, "");

    for (const path of sensitivePaths) {
      const probeUrl = `${baseUrl}${path}`;

      const response = await axios.get(probeUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 5000,
        validateStatus: () => true,
      });

      if (response.status === 200) {
        const bodyText = typeof response.data === "string" ? response.data : JSON.stringify(response.data || "");
        if (bodyText.includes("ref: refs/heads/") || bodyText.includes("DB_PASSWORD") || path === "/admin") {
          const finding = createFinding("SENSITIVE_DIRECTORY_EXPOSURE") || {
            title: `Exposed Sensitive Path (${path})`,
            severity: path.includes(".env") || path.includes(".git") ? "CRITICAL" : "HIGH",
            cwe: "538",
            owasp: "API8:2023 Security Misconfiguration",
            description: `Publicly accessible sensitive administrative path or configuration backup file discovered at ${probeUrl}.`,
          };
          findings.push(finding);
          break;
        }
      }
    }
  } catch (err) {
    console.warn(`[directory-bruteforce-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanDirectoryBruteforce };
