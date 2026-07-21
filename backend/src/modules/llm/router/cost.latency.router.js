/**
 * Cost & Latency Aware Router (Sprint 17)
 * Tracks latency and estimated token costs for all LLM providers and routes requests
 * based on operational mode ('cheap+fast' vs 'best_quality').
 */
class CostLatencyRouter {
  constructor() {
    this.metrics = {
      groq: { avgLatencyMs: 250, costPer1kTokens: 0.0001 },
      deepseek: { avgLatencyMs: 400, costPer1kTokens: 0.0002 },
      openrouter: { avgLatencyMs: 500, costPer1kTokens: 0.0000 }, // free tier
      pollinations: { avgLatencyMs: 600, costPer1kTokens: 0.0000 }, // keyless
      openai: { avgLatencyMs: 800, costPer1kTokens: 0.0015 },
      claude: { avgLatencyMs: 950, costPer1kTokens: 0.0030 },
      gemini: { avgLatencyMs: 700, costPer1kTokens: 0.0005 },
    };
  }

  recordCall(provider, latencyMs, tokens = 0) {
    const key = provider?.toLowerCase();
    if (!this.metrics[key]) {
      this.metrics[key] = { avgLatencyMs: latencyMs, costPer1kTokens: 0.0005 };
    } else {
      // Exponential moving average for latency
      this.metrics[key].avgLatencyMs = Math.round(this.metrics[key].avgLatencyMs * 0.7 + latencyMs * 0.3);
    }
  }

  selectBestProvider(mode = "balanced", candidates = []) {
    if (!candidates || candidates.length === 0) {
      candidates = Object.keys(this.metrics);
    }

    if (mode === "cheap_fast") {
      // Sort by cost ascending, then latency
      return [...candidates].sort((a, b) => {
        const costA = this.metrics[a]?.costPer1kTokens ?? 0.001;
        const costB = this.metrics[b]?.costPer1kTokens ?? 0.001;
        if (costA !== costB) return costA - costB;
        return (this.metrics[a]?.avgLatencyMs ?? 500) - (this.metrics[b]?.avgLatencyMs ?? 500);
      })[0];
    }

    if (mode === "best_quality") {
      // Prioritize high-tier models
      const priority = ["claude", "openai", "gemini", "deepseek", "openrouter"];
      const match = priority.find((p) => candidates.includes(p));
      return match || candidates[0];
    }

    // Default: balanced
    return candidates[0];
  }

  getTelemetry() {
    return {
      providers: this.metrics,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new CostLatencyRouter();
