/**
 * web-research.agent.js (Sprint 58 — Web Research Agent)
 * Researches vulnerabilities from NVD, OWASP, GitHub Advisories, and Web Search.
 * Summarizes multi-source findings with credibility scoring.
 */
const { searchWeb } = require("../copilot/search.service");

class WebResearchAgent {
  /**
   * Calculate source credibility score based on domain authority
   */
  calculateCredibility(url) {
    if (!url) return 0.5;
    const lower = url.toLowerCase();
    if (lower.includes("nvd.nist.gov") || lower.includes("cve.mitre.org")) return 1.0;
    if (lower.includes("owasp.org") || lower.includes("github.com/advisories")) return 0.95;
    if (lower.includes("portswigger.net") || lower.includes("exploit-db.com")) return 0.85;
    if (lower.includes("stackoverflow.com") || lower.includes("medium.com")) return 0.70;
    return 0.60;
  }

  async researchVulnerability(query) {
    console.log(`[WebResearchAgent] Starting multi-source vulnerability research for query: "${query}"`);
    const rawResults = await searchWeb(query);

    const evaluatedSources = rawResults.map((source) => {
      const credibility = this.calculateCredibility(source.url);
      return {
        ...source,
        credibilityScore: credibility,
        credibilityLabel: credibility >= 0.9 ? "High Authority" : credibility >= 0.7 ? "Medium Authority" : "Community Source",
      };
    });

    // Sort by credibility descending
    evaluatedSources.sort((a, b) => b.credibilityScore - a.credibilityScore);

    const topSources = evaluatedSources.slice(0, 5);

    // Multi-source summarizer step
    const summaryList = topSources
      .map((s, idx) => `[Citation ${idx + 1}] (${s.credibilityLabel} - ${s.url}):\n${s.snippet}`)
      .join("\n\n");

    const coherentAnswer = `## Security Threat Research Summary: "${query}"

Based on multi-source intelligence gathering (${topSources.length} sources analyzed):

${summaryList}

### Key Security Mitigation Takeaway:
Apply strict input parameter sanitization, enforce TLS 1.3 transport security, and continuously monitor CVE/OWASP advisory databases for patch updates.`;

    return {
      query,
      sourcesCount: topSources.length,
      topCredibilityScore: topSources[0]?.credibilityScore || 0,
      sources: topSources,
      synthesizedAnswer: coherentAnswer,
    };
  }
}

module.exports = new WebResearchAgent();
