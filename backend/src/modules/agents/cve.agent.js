const BaseAgent = require("./base.agent");

class CVEAgent extends BaseAgent {
  constructor() {
    super(
      "CVEAnalyst",
      "You are a CVE Analyst Agent. Your role is to look up and match the given security finding against standard CVE databases, OWASP Top 10 categories, and CWE mappings. Provide CVSS severity scoring details and formal reference indices.",
      "gemini" // Sprint 30 target provider
    );
  }
}

module.exports = new CVEAgent();
