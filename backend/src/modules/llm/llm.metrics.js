class LLMMetricsStore {
  constructor() {
    this.metrics = {};
  }

  /**
   * Initialize metrics for a model if not present
   */
  initModelMetrics(providerAndModel) {
    if (!this.metrics[providerAndModel]) {
      this.metrics[providerAndModel] = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageLatencyMs: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalTokens: 0,
        lastActive: null,
      };
    }
  }

  /**
   * Record metrics for a successful LLM invocation
   */
  recordSuccess(providerAndModel, latencyMs, usage = {}) {
    this.initModelMetrics(providerAndModel);
    const m = this.metrics[providerAndModel];

    m.totalRequests += 1;
    m.successfulRequests += 1;
    m.lastActive = new Date();

    // Recalculate rolling average latency
    m.averageLatencyMs = Math.round(
      (m.averageLatencyMs * (m.successfulRequests - 1) + latencyMs) / m.successfulRequests
    );

    // Accumulate tokens
    m.totalPromptTokens += usage.promptTokens || 0;
    m.totalCompletionTokens += usage.completionTokens || 0;
    m.totalTokens += usage.totalTokens || 0;
  }

  /**
   * Record metrics for a failed LLM invocation
   */
  recordFailure(providerAndModel, latencyMs) {
    this.initModelMetrics(providerAndModel);
    const m = this.metrics[providerAndModel];

    m.totalRequests += 1;
    m.failedRequests += 1;
    m.lastActive = new Date();
  }

  /**
   * Fetch all metrics
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Fetch metrics for a specific model key
   */
  getModelMetrics(providerAndModel) {
    return this.metrics[providerAndModel] || null;
  }

  /**
   * Reset store metrics
   */
  reset() {
    this.metrics = {};
  }
}

module.exports = new LLMMetricsStore();
