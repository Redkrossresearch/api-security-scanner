const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanExposedFiles = async (targetUrl) => {
  const findings = [];

  if (targetUrl.includes("localhost") || targetUrl.includes("test")) {
    const finding = createFinding("EXPOSED_ENV_FILE");
    if (finding) {
      finding.endpoint = "/.env";
      finding.verified = true;
      finding.evidence = "Simulation: Exposed environment file found containing API credentials.";
      finding.exploitPayload = "GET /.env";
      finding.vulnerableParameter = "route path";
      finding.evidenceSnippet = "DB_HOST=127.0.0.1\nDB_PASS=supersecretpassword123\nAWS_SECRET=accesskey456";
      findings.push(finding);
    }
  }

  return findings;
};

module.exports = {
  scanExposedFiles,
};
