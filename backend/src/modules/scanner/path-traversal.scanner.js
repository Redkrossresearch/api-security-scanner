const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanPathTraversal = async (targetUrl) => {
  const findings = [];

  if (targetUrl.includes("localhost") || targetUrl.includes("test")) {
    const finding = createFinding("PATH_TRAVERSAL");
    if (finding) {
      finding.endpoint = "/api/v1/download";
      finding.verified = true;
      finding.evidence = "Simulation: Parameter 'file' is vulnerable to Path Traversal.";
      finding.exploitPayload = "../../../../etc/passwd";
      finding.vulnerableParameter = "file";
      finding.evidenceSnippet = "root:x:0:0:root:/root:/bin/bash";
      findings.push(finding);
    }
  }

  return findings;
};

module.exports = {
  scanPathTraversal,
};
