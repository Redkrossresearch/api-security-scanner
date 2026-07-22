/**
 * security.agent.js (Sprint 32 — Security Expert Agent)
 * Specialized agent wrapping scanner modules for endpoint analysis & vulnerability findings.
 */
const BaseAgent = require("./base.agent");

class SecurityAgent extends BaseAgent {
  constructor() {
    super(
      "SecurityAgent",
      "Senior Application Security Specialist",
      `Analyze API endpoints, scan results, and OpenAPI declarations to identify security flaws (OWASP Top 10, SQLi, XSS, CORS, Broken Auth, Rate Limit vulnerabilities). Provide structured finding summaries with severity ratings.`,
      ["sql-injection-scanner", "xss-scanner", "cors-scanner", "rate-limit-scanner"],
      "claude"
    );
  }
}

module.exports = new SecurityAgent();
