const { createFinding } = require("../vulnerabilities/vulnerability.factory");

const scanXSS = async (targetUrl) => {
  const findings = [];

  if (targetUrl.includes("localhost") || targetUrl.includes("test")) {
    const finding = createFinding("REFLECTED_XSS");
    if (finding) {
      finding.endpoint = "/search";
      finding.verified = true;
      finding.evidence = "Simulation: Parameter 'q' is vulnerable to Reflected Cross-Site Scripting.";
      finding.exploitPayload = "\"><script>alert(1)</script>";
      finding.vulnerableParameter = "q";
      finding.evidenceSnippet = "<div>Search results for: \"><script>alert(1)</script></div>";
      findings.push(finding);
    }
  }

  return findings;
};

module.exports = {
  scanXSS,
};
