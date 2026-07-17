require("dotenv").config({ path: "../../../../.env" });
const llmRegistry = require("../llm.registry");
const llmRouter = require("../router/llm.router");
const cb = require("../router/llm.circuitbreaker");

async function runChaosTest() {
  console.log("=== Launching Reliability Fallback Chaos Test (Sprint 59) ===");

  const originalFallback = llmRegistry.getFallbackChain();
  console.log("Normal active fallback chain:", originalFallback);

  // 1. Simulate Failures on OpenRouter & OpenAI to trip the circuit breaker
  console.log("\n[Chaos] Simulating consecutive failures on 'openrouter'...");
  cb.recordFailure("openrouter");
  cb.recordFailure("openrouter");
  cb.recordFailure("openrouter"); // Tripped!

  console.log("[Chaos] Simulating consecutive failures on 'openai'...");
  cb.recordFailure("openai");
  cb.recordFailure("openai");
  cb.recordFailure("openai"); // Tripped!

  // 2. Query updated fallback chain
  const brokenFallback = llmRegistry.getFallbackChain();
  console.log("\n[Chaos] Post-failure active fallback chain (tripped providers filtered):", brokenFallback);

  if (brokenFallback.includes("openrouter") || brokenFallback.includes("openai")) {
    console.error("❌ Fallback check failed: Tripped providers are still present in fallback chain.");
  } else {
    console.log("✅ Fallback check succeeded: Tripped providers were filtered out successfully!");
  }

  // 3. Test Routing under Chaos
  const query = "Write a SQL query parameters fix.";
  console.log(`\n[Chaos] Routing query: "${query}"`);
  const routed = llmRouter.route(query);
  console.log(`Routed to: ${routed.provider} | Remaining preference chain:`, routed.preferences);

  // 4. Recover one provider and verify it comes back
  console.log("\n[Chaos] Simulating success on 'openrouter' to recover state...");
  cb.recordSuccess("openrouter");

  const recoveredFallback = llmRegistry.getFallbackChain();
  console.log("Recovered fallback chain:", recoveredFallback);
  if (recoveredFallback.includes("openrouter")) {
    console.log("✅ State recovery check succeeded: recovered provider is back online!");
  } else {
    console.error("❌ State recovery check failed.");
  }
}

runChaosTest().catch(console.error);
