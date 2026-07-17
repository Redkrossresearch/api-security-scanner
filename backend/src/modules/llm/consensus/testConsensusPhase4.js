require("dotenv").config({ path: "../../../../.env" });
const consensusEngine = require("./consensus.engine");
const { confidenceEngine } = require("./confidence.engine");

async function runTest() {
  console.log("=== Testing Consensus, Debate & Confidence Engine (Phase 4) ===");

  // 1. Test Confidence Calculation v2
  console.log("\nTesting Confidence Formula Scoring:");
  // case A: high consensus (100), good evidence (80), fresh source (90)
  const scoreA = confidenceEngine.calculateConfidence(100, 80, 90);
  // case B: low consensus (30), poor evidence (10), stale source (20)
  const scoreB = confidenceEngine.calculateConfidence(30, 10, 20);

  console.log(`High Quality Confidence Score: ${scoreA}/100 (Expected: High)`);
  console.log(`Low Quality Confidence Score: ${scoreB}/100 (Expected: Low)`);

  // 2. Test Consensus evaluation structure
  console.log("\nSimulating Consensus participants structure...");
  const mockResponses = [
    { provider: "openai", content: "Critical: vulnerable to SQLi on user input parameter" },
    { provider: "claude", content: "High: sql injection possible in users table request" },
    { provider: "gemini", content: "Safe: query parameters are sanitized inside JPA entity configs" }
  ];

  // We can evaluate the formatting of evaluateConsensusWithJudge block mock parameters
  const judgePromptMock = mockResponses
    .map((r, i) => `--- RESPONSE #${i + 1} (${r.provider}) ---\n${r.content}`)
    .join("\n\n");
  console.log("Structured Judge Input Prompt Block:\n", judgePromptMock);

  console.log("=== Phase 4 consensus verification complete ===");
}

runTest().catch(console.error);
