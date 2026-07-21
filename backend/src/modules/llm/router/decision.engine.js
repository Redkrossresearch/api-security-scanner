/**
 * Decision Engine v1 (Sprint 22)
 * Evaluates candidate responses from multiple LLM providers and scores them based on
 * completeness, length sanity, citation presence, code syntax cleanliness, and safety flags.
 */
class DecisionEngine {
  scoreResponse(response) {
    if (!response || typeof response !== "object") return 0;
    const text = response.content || response.output || "";
    
    let score = 0;

    // 1. Length Sanity Score (20 points max)
    const charCount = text.length;
    if (charCount > 50 && charCount < 10000) {
      score += 20;
    } else if (charCount >= 10000) {
      score += 10;
    }

    // 2. Structured Content / Markdown formatting (25 points)
    if (text.includes("```") || text.includes("#") || text.includes("|")) {
      score += 25;
    }

    // 3. Citation / Reference presence (25 points)
    if (text.includes("http") || text.includes("CVE-") || text.includes("OWASP") || text.includes("[1]")) {
      score += 25;
    }

    // 4. Safety & Error sanity (30 points)
    if (!text.toLowerCase().includes("error") && !text.toLowerCase().includes("rate limit exceeded")) {
      score += 30;
    }

    return score;
  }

  selectBestResponse(responses = []) {
    if (!responses || responses.length === 0) return null;

    const scored = responses.map((res) => ({
      response: res,
      score: this.scoreResponse(res),
    }));

    scored.sort((a, b) => b.score - a.score);

    return {
      bestResponse: scored[0].response,
      bestScore: scored[0].score,
      allScored: scored,
    };
  }
}

module.exports = new DecisionEngine();
