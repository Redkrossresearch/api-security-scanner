const axios = require("axios");
const https = require("https");
const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanGRPCSecurity = async (targetUrl) => {
  const findings = [];
  try {
    const response = await axios.post(
      targetUrl,
      {},
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ATHX-Security-Scanner/4.2",
          "Content-Type": "application/grpc",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        timeout: 5000,
        validateStatus: () => true,
      }
    );

    const grpcStatus = response.headers["grpc-status"];

    if (grpcStatus === "0" || response.headers["content-type"]?.includes("grpc")) {
      const finding = createFinding("UNAUTHENTICATED_GRPC_REFLECTION") || {
        title: "Unauthenticated gRPC Service Exposure",
        severity: "MEDIUM",
        cwe: "200",
        owasp: "API8:2023 Security Misconfiguration",
        description: `Target endpoint ${targetUrl} accepted gRPC framing (application/grpc) without enforcing client transport security.`,
      };
      findings.push(finding);
    }
  } catch (err) {
    console.warn(`[grpc-security-scanner] Error checking ${targetUrl}:`, err.message);
  }

  return findings;
};

module.exports = { scanGRPCSecurity };
