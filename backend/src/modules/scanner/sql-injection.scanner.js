const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanSQLi = async (targetUrl) => {
  // Deterministic simulation based on target URL
  const findings = [];
  
  if (targetUrl.includes("localhost") || targetUrl.includes("test")) {
    const finding = createFinding("SQL_INJECTION");
    if (finding) {
      finding.endpoint = "/api/v1/users";
      finding.verified = true;
      finding.evidence = "Simulation: Parameter 'id' is vulnerable to numeric SQL Injection.";
      finding.exploitPayload = "1' OR 1=1 --";
      finding.vulnerableParameter = "id";
      finding.evidenceSnippet = "SQL Server Error: Unclosed quotation mark after the character string.";
      findings.push(finding);
    }
  }

  return findings;
};

module.exports = {
  scanSQLi,
};
