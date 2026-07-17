const llmRegistry = require("../llm.registry");

class LLMFunnelManager {
  /**
   * Run multiple LLM queries in parallel and return results
   */
  async runParallel(providers, messages, options = {}) {
    console.log(`[llm-funnel] Running parallel queries on providers: ${providers.join(", ")}`);
    
    const promises = providers.map(async (provider) => {
      const adapter = llmRegistry.getAdapter(provider);
      const start = Date.now();
      try {
        const result = await adapter.generate(messages, options);
        return {
          provider,
          success: true,
          content: result.content,
          latencyMs: Date.now() - start,
        };
      } catch (err) {
        return {
          provider,
          success: false,
          error: err.message,
          latencyMs: Date.now() - start,
        };
      }
    });

    const results = await Promise.allSettled(promises);
    return results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);
  }

  /**
   * Score an LLM response on a scale of 0 to 100
   */
  scoreResponse(content) {
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return 0;
    }

    let score = 0;

    // 1. Length sanity (max 40 points)
    const len = content.length;
    if (len > 300) {
      score += 40;
    } else if (len > 100) {
      score += 20;
    }

    // 2. Contains code blocks (max 30 points)
    if (content.includes("```")) {
      score += 30;
    }

    // 3. Contains citation links or reference section (max 30 points)
    if (/references|links|source|http/i.test(content)) {
      score += 30;
    }

    return score;
  }

  /**
   * Merges two LLM responses into a unified coherent output
   */
  mergeResponses(respA, respB) {
    console.log(`[llm-funnel] Merging complementary sections from ${respA.provider} and ${respB.provider}`);
    
    return `### 🤖 Synthesized Security Consensus

> [!NOTE]
> This analysis is a synthesized consensus compiled from parallel intelligence evaluations (${respA.provider} & ${respB.provider}).

${respA.content}

---

### 🛡️ Complementary Insights (${respB.provider})

${respB.content}
`;
  }

  /**
   * Process incoming request through parallel funnel and decision matching
   */
  async executeFunnel(providers, messages, options = {}) {
    const results = await this.runParallel(providers, messages, options);
    const successful = results.filter((r) => r.success);

    if (successful.length === 0) {
      throw new Error("All parallel funnel calls failed.");
    }

    // Score all successful responses
    const scored = successful.map((r) => ({
      ...r,
      score: this.scoreResponse(r.content),
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    console.log("[llm-funnel] Scored responses:", scored.map(s => `${s.provider}: ${s.score}`).join(" | "));

    const best = scored[0];
    const runnerUp = scored[1];

    // If scores are close (within 10 points) and both exist, merge them!
    if (runnerUp && Math.abs(best.score - runnerUp.score) <= 10) {
      return {
        content: this.mergeResponses(best, runnerUp),
        model: `${best.provider}+${runnerUp.provider}`,
      };
    }

    return {
      content: best.content,
      model: best.provider,
    };
  }
}

module.exports = new LLMFunnelManager();
