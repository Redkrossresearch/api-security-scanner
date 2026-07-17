class LLMSelfLearning {
  constructor() {
    this.feedbackLogs = {}; // provider:category -> { positive: 0, negative: 0 }
    this.demotedProviders = new Set();
  }

  /**
   * Log feedback and dynamically update routing priorities (Sprint 57)
   */
  logFeedback(provider, category, isPositive) {
    const key = `${provider}:${category}`;
    if (!this.feedbackLogs[key]) {
      this.feedbackLogs[key] = { positive: 0, negative: 0 };
    }

    if (isPositive) {
      this.feedbackLogs[key].positive += 1;
    } else {
      this.feedbackLogs[key].negative += 1;
    }

    const stats = this.feedbackLogs[key];
    console.log(`[self-learning] Feedback logged for ${key}. Current stats: +${stats.positive} / -${stats.negative}`);

    // If negative feedback exceeds threshold (e.g. 3) and is greater than positive, demote provider!
    if (stats.negative >= 3 && stats.negative > stats.positive) {
      this.demotedProviders.add(key);
      console.warn(`[self-learning] Provider ${provider} demoted for category ${category} due to poor feedback stats!`);
    }
  }

  /**
   * Check if a provider is demoted for a specific category
   */
  isDemoted(provider, category) {
    return this.demotedProviders.has(`${provider}:${category}`);
  }
}

module.exports = new LLMSelfLearning();
