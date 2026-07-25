const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanCloudMetadata = async (targetUrl) => {
  const findings = [];
  try {
    const imdsPayloads = [
      "http://169.254.169.254/latest/meta-data/",
      "http://metadata.google.internal/computeMetadata/v1/",
      "http://169.254.169.254/metadata/instance?api-version=2021-02-01",
    ];

    // Probe if endpoint acts as an open proxy or accepts SSRF target parameters
    for (const payload of imdsPayloads) {
      const probeUrl = `${targetUrl}${targetUrl.includes("?") ? "&" : "?"}url=${encodeURIComponent(payload)}&path=${encodeURIComponent(payload)}`;

      const response = await axios.get(probeUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
          "Metadata-Flavor": "Google",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 6000,
        validateStatus: () => true,
      });

      const bodyText = typeof response.data === "string" ? response.data : JSON.stringify(response.data || "");

      if (
        bodyText.includes("ami-id") ||
        bodyText.includes("instance-id") ||
        bodyText.includes("iam/security-credentials") ||
        bodyText.includes("computeMetadata")
      ) {
        const finding = createFinding("CLOUD_IMDS_SSRF_EXPOSURE") || {
          title: "Cloud IMDS SSRF Metadata Leakage",
          severity: "CRITICAL",
          cwe: "918",
          owasp: "API7:2023 Server Side Request Forgery",
          description: `Target endpoint ${targetUrl} reflected cloud metadata instance details when passed payload ${payload}. An attacker can steal IAM credentials and escalate cloud environment privileges.`,
        };
        findings.push(finding);
        break;
      }
    }
  } catch (err) {
    console.warn(`[cloud-metadata-scanner] Error probing ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanCloudMetadata };
