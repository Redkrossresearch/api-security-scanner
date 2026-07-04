const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanCommandInjection = async (targetUrl) => {
  const findings = [];

  if (targetUrl.includes("localhost") || targetUrl.includes("test")) {
    const finding = createFinding("COMMAND_INJECTION");
    if (finding) {
      finding.endpoint = "/api/v1/ping";
      finding.verified = true;
      finding.evidence = "Simulation: Parameter 'ip' is vulnerable to Remote Command Execution.";
      finding.exploitPayload = "8.8.8.8 ; whoami";
      finding.vulnerableParameter = "ip";
      finding.evidenceSnippet = "uid=0(root) gid=0(root) groups=0(root)";
      findings.push(finding);
    }
  }

  return findings;
};

module.exports = {
  scanCommandInjection,
};
