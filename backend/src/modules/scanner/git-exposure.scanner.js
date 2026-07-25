const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanGitExposure = async (targetUrl) => {
  const findings = [];
  try {
    const gitPaths = ["/.git/HEAD", "/.git/config", "/.git/index"];
    const baseUrl = targetUrl.replace(/\/+$/, "");

    for (const path of gitPaths) {
      const probeUrl = `${baseUrl}${path}`;

      const response = await axios.get(probeUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 5000,
        validateStatus: () => true,
      });

      const bodyText = typeof response.data === "string" ? response.data : JSON.stringify(response.data || "");

      if (response.status === 200 && (bodyText.includes("ref: refs/") || bodyText.includes("[core]") || bodyText.includes("DIRC"))) {
        const finding = createFinding("PUBLIC_GIT_REPOSITORY_EXPOSURE") || {
          title: "Public Git Repository Source Code Exposure",
          severity: "CRITICAL",
          cwe: "538",
          owasp: "API8:2023 Security Misconfiguration",
          description: `Exposed public Git repository folder (.git) discovered at ${probeUrl}. Attackers can download complete source code and history.`,
        };
        findings.push(finding);
        break;
      }
    }
  } catch (err) {
    console.warn(`[git-exposure-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanGitExposure };
