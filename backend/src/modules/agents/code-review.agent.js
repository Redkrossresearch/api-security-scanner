/**
 * code-review.agent.js (Sprint 36 — Code Review Agent)
 * Performs AI-driven static security review of source code and OpenAPI specifications.
 */
const BaseAgent = require("./base.agent");

class CodeReviewAgent extends BaseAgent {
  constructor() {
    super(
      "CodeReviewAgent",
      "Lead Code Reviewer & Static Analysis Expert",
      `Analyze source code snippets, OpenAPI specs, and framework configurations to identify static security flaws, insecure default settings, hardcoded credentials, and missing input sanitization. Output 3+ actionable, high-impact observations with concrete remediation hints.`,
      ["static-code-analysis", "openapi-spec-review", "secret-detection"],
      "claude"
    );
  }
}

module.exports = new CodeReviewAgent();
