require("dotenv").config({ path: "../../../../.env" });
const llmRouter = require("../router/llm.router");
const funnelManager = require("../router/llm.funnel");

async function runTest() {
  console.log("=== Testing API Funnel Router & Intelligent Routing (Phase 3) ===");

  // 1. Test Category classification
  const testQueries = [
    { text: "Fix SQL injection vulnerability by parameterizing query.", expected: "coding" },
    { text: "Explain the threat vectors of broken object level authorization.", expected: "reasoning" },
    { text: "What is the best way to cook spaghetti?", expected: "general" }
  ];

  console.log("\nTesting Classification Categories:");
  testQueries.forEach((q) => {
    const category = llmRouter.classifyQuery(q.text);
    const success = category === q.expected;
    console.log(`Query: "${q.text.slice(0, 35)}..." | Got: ${category} | Expected: ${q.expected} | Success: ${success ? '✅' : '❌'}`);
  });

  // 2. Test Response Scoring
  console.log("\nTesting Response Scoring Engine:");
  const sampleA = "This is a short reply.";
  const sampleB = "This is a comprehensive response explaining SQL injection.\n```sql\nSELECT * FROM users WHERE id = ?;\n```\nSee OWASP references at https://owasp.org";
  
  const scoreA = funnelManager.scoreResponse(sampleA);
  const scoreB = funnelManager.scoreResponse(sampleB);
  console.log(`Sample A Score: ${scoreA} (Expected: Low)`);
  console.log(`Sample B Score: ${scoreB} (Expected: High)`);

  // 3. Test Response Merging
  console.log("\nTesting Response Merging Synthesis:");
  const respA = { provider: "openai", content: "Use strict Content Security Policy headers." };
  const respB = { provider: "claude", content: "Configure headers: Content-Security-Policy: default-src 'self'" };
  const merged = funnelManager.mergeResponses(respA, respB);
  console.log(merged);

  console.log("=== Phase 3 routing logic checks finished ===");
}

runTest().catch(console.error);
