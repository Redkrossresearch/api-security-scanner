require("dotenv").config({ path: "../.env" });
const llmRegistry = require("./llm.registry");
const llmRouter = require("./router/llm.router");
const llmConsensusEngine = require("./consensus/consensus.engine");
const llmFunnelManager = require("./router/llm.funnel");

async function runTests() {
  console.log("=== Testing LLM Registry Configurations ===");
  const configured = llmRegistry.getFallbackChain();
  console.log("Configured adapters in fallback chain:", configured);

  console.log("\n=== Testing Router Classifier ===");
  const queries = [
    "Write a secure express middleware patch to resolve XSS",
    "Explain the OWASP Top 10 vulnerabilities",
    "Hi there, how are you?",
  ];

  for (const q of queries) {
    const route = llmRouter.route(q);
    console.log(`Query: "${q}"`);
    console.log(`Routed to: ${route.provider} | Preferences:`, route.preferences);
  }

  console.log("\n=== Testing Consensus Voting Engine ===");
  try {
    const messages = [{ role: "user", content: "Briefly define IDOR vulnerability in 1 sentence." }];
    const result = await llmConsensusEngine.runConsensus(messages, { temperature: 0.5 });
    console.log("Consensus Result:\n", result.content);
  } catch (err) {
    console.error("Consensus test failed:", err.message);
  }

  console.log("\n=== Testing AI Debate Mode ===");
  try {
    const finding = "Found sensitive credentials exposed in git config metadata folder.";
    const result = await llmConsensusEngine.runDebate(finding, { temperature: 0.7 });
    console.log("Debate Result:\n", result.content);
  } catch (err) {
    console.error("Debate test failed:", err.message);
  }
}

runTests().catch(console.error);
