const axios = require("axios");

// Circuit breaker state per provider
const circuitBreakers = {
  openrouter: { failures: 0, state: "CLOSED", lastFailureTime: null },
  pollinations: { failures: 0, state: "CLOSED", lastFailureTime: null }
};

const FAILURE_THRESHOLD = 3;
const COOLDOWN_MS = 30000; // 30 seconds cooldown

const getCircuitState = (provider) => {
  const cb = circuitBreakers[provider];
  if (!cb) return "CLOSED";
  
  if (cb.state === "OPEN") {
    const elapsed = Date.now() - cb.lastFailureTime;
    if (elapsed > COOLDOWN_MS) {
      cb.state = "HALF-OPEN";
      console.log(`[resilience] Circuit breaker for "${provider}" transitioned to HALF-OPEN (cooldown expired)`);
      return "HALF-OPEN";
    }
    return "OPEN";
  }
  return cb.state;
};

const recordSuccess = (provider) => {
  const cb = circuitBreakers[provider];
  if (cb) {
    cb.failures = 0;
    cb.state = "CLOSED";
    cb.lastFailureTime = null;
  }
};

const recordFailure = (provider) => {
  const cb = circuitBreakers[provider];
  if (!cb) return;
  
  cb.failures++;
  cb.lastFailureTime = Date.now();
  if (cb.failures >= FAILURE_THRESHOLD) {
    cb.state = "OPEN";
    console.warn(`[resilience] Circuit breaker for "${provider}" TRIPPED to OPEN due to ${cb.failures} consecutive failures.`);
  }
};

// Retry with exponential backoff
const retryWithBackoff = async (fn, provider, attempts = 2, delay = 500) => {
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await fn();
      recordSuccess(provider);
      return result;
    } catch (err) {
      console.warn(`[resilience] Attempt ${i + 1} failed for provider "${provider}": ${err.message}`);
      if (i === attempts - 1) {
        recordFailure(provider);
        throw err;
      }
      // Wait for backoff delay
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

/**
 * Executes a function with primary provider, or fails over to fallback provider if circuit breaker is open or calls fail.
 * @param {string} primaryName - Name of primary provider (e.g. 'openrouter')
 * @param {function} primaryFn - Function to execute primary request
 * @param {string} fallbackName - Name of fallback provider (e.g. 'pollinations')
 * @param {function} fallbackFn - Function to execute fallback request
 */
const executeResilientLlm = async (primaryName, primaryFn, fallbackName, fallbackFn) => {
  const primaryState = getCircuitState(primaryName);
  
  if (primaryState === "OPEN") {
    console.warn(`[resilience] Primary provider "${primaryName}" circuit is OPEN. Directly routing to fallback "${fallbackName}".`);
    try {
      return await retryWithBackoff(fallbackFn, fallbackName);
    } catch (fallbackErr) {
      console.error(`[resilience] Fallback provider "${fallbackName}" also failed: ${fallbackErr.message}`);
      throw new Error(`All LLM providers failed: ${fallbackErr.message}`);
    }
  }
  
  try {
    // Try primary first
    return await retryWithBackoff(primaryFn, primaryName);
  } catch (primaryErr) {
    console.warn(`[resilience] Primary provider "${primaryName}" failed all retries. Falling back to "${fallbackName}"...`);
    try {
      return await retryWithBackoff(fallbackFn, fallbackName);
    } catch (fallbackErr) {
      console.error(`[resilience] Fallback provider "${fallbackName}" also failed: ${fallbackErr.message}`);
      throw new Error(`All LLM providers failed. Primary error: ${primaryErr.message}. Fallback error: ${fallbackErr.message}`);
    }
  }
};

module.exports = {
  executeResilientLlm,
  getCircuitState,
  retryWithBackoff
};
