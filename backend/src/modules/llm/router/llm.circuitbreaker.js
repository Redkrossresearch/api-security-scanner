class LLMCircuitBreaker {
  constructor() {
    this.states = {}; // provider -> { status: "closed"|"open"|"half-open", failures: 0, lastFailureTime: null }
    this.threshold = 3;
    this.cooldownMs = 30000; // 30 seconds cooldown
  }

  initState(provider) {
    if (!this.states[provider]) {
      this.states[provider] = {
        status: "closed",
        failures: 0,
        lastFailureTime: null,
      };
    }
  }

  isAvailable(provider) {
    this.initState(provider);
    const state = this.states[provider];

    if (state.status === "open") {
      const now = Date.now();
      if (now - state.lastFailureTime > this.cooldownMs) {
        state.status = "half-open";
        console.log(`[llm-circuit] Provider ${provider} transition to HALF-OPEN (testing)`);
        return true;
      }
      return false; // Skip
    }

    return true;
  }

  recordSuccess(provider) {
    this.initState(provider);
    const state = this.states[provider];
    
    if (state.status === "half-open" || state.status === "open") {
      console.log(`[llm-circuit] Provider ${provider} recovered. Status: CLOSED`);
    }
    state.status = "closed";
    state.failures = 0;
    state.lastFailureTime = null;
  }

  recordFailure(provider) {
    this.initState(provider);
    const state = this.states[provider];

    state.failures += 1;
    state.lastFailureTime = Date.now();

    if (state.failures >= this.threshold) {
      state.status = "open";
      console.warn(`[llm-circuit] Provider ${provider} TRIPPED! Status: OPEN for ${this.cooldownMs / 1000}s`);
    }
  }
}

module.exports = new LLMCircuitBreaker();
