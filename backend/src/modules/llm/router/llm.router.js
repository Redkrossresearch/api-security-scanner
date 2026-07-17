const llmRegistry = require("../llm.registry");

class LLMRouter {
  /**
   * Classify user query using heuristic keywords
   */
  classifyQuery(query) {
    const q = query.toLowerCase();

    // 1. Coding & Remediation queries
    const codingKeywords = [
      "code", "function", "javascript", "python", "remediation", "patch", "fix", "script",
      "middleware", "regex", "cve", "syntax", "compile", "handler", "express", "sql injection patch"
    ];
    if (codingKeywords.some((kw) => q.includes(kw))) {
      return "coding";
    }

    // 2. High reasoning/logic queries
    const reasoningKeywords = [
      "explain", "why", "analyze", "architecture", "threat", "penetration", "concept",
      "owasp", "cwe", "bola", "idor", "broken object", "auth bypass", "principle", "vector"
    ];
    if (reasoningKeywords.some((kw) => q.includes(kw))) {
      return "reasoning";
    }

    // 3. Default general intent
    return "general";
  }

  /**
   * Resolve the best active provider and model for a query
   */
  route(query, options = {}) {
    const category = this.classifyQuery(query);
    const configured = llmRegistry.getFallbackChain();

    console.log(`[llm-router] Routing query: "${query.slice(0, 50)}..." | Classified: ${category}`);

    // Map categories to list of preferred models (order of preference)
    let preferences = [];
    if (category === "coding") {
      preferences = ["claude", "openrouter", "openai", "deepseek", "qwen"];
    } else if (category === "reasoning") {
      preferences = ["deepseek", "openai", "claude", "openrouter"];
    } else {
      preferences = ["openai", "gemini", "llama", "openrouter"];
    }

    // Sort preferences dynamically based on metrics (demote failing, slow, and poorly-rated providers)
    const llmMetrics = require("../llm.metrics");
    const selfLearning = require("./llm.selflearning");
    preferences.sort((a, b) => {
      const demotedA = selfLearning.isDemoted(a, category);
      const demotedB = selfLearning.isDemoted(b, category);

      if (demotedA && !demotedB) return 1;
      if (demotedB && !demotedA) return -1;

      // Find adapter default models to lookup metrics
      const adapterA = llmRegistry.adapters[a];
      const adapterB = llmRegistry.adapters[b];
      const modelA = adapterA ? adapterA.defaultModel : a;
      const modelB = adapterB ? adapterB.defaultModel : b;

      const metricsA = llmMetrics.getModelMetrics(`${a}:${modelA}`);
      const metricsB = llmMetrics.getModelMetrics(`${b}:${modelB}`);

      const failureRateA = metricsA && metricsA.totalRequests > 0 ? metricsA.failedRequests / metricsA.totalRequests : 0;
      const failureRateB = metricsB && metricsB.totalRequests > 0 ? metricsB.failedRequests / metricsB.totalRequests : 0;

      // Demote if failure rate is high (>30%)
      if (failureRateA > 0.3 && failureRateB <= 0.3) return 1;
      if (failureRateB > 0.3 && failureRateA <= 0.3) return -1;

      // Otherwise prioritize faster average latency
      const latencyA = metricsA ? metricsA.averageLatencyMs : 0;
      const latencyB = metricsB ? metricsB.averageLatencyMs : 0;
      if (latencyA && latencyB) {
        return latencyA - latencyB;
      }
      return 0;
    });

    // Find the target preferred provider
    const targetProvider = preferences.find((p) => configured.includes(p)) || configured[0] || "mock";
    console.log(`[llm-router] Selected preferred provider: ${targetProvider} for category: ${category}`);

    return {
      provider: targetProvider,
      category,
      preferences: Array.from(new Set([...preferences.filter(p => configured.includes(p)), ...configured]))
    };
  }
}

module.exports = new LLMRouter();
