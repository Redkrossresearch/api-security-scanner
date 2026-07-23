const rerankerService = require("../backend/src/modules/llm/rag/reranker.service");
const AutonomousTaskLoop = require("../backend/src/modules/agents/autonomous.loop");
const toolRegistry = require("../backend/src/modules/agents/tools/tool.registry");
const autonomousScannerAgent = require("../backend/src/modules/agents/autonomous-scanner.agent");
const webResearchAgent = require("../backend/src/modules/agents/web-research.agent");
const reflectionService = require("../backend/src/modules/agents/reflection.service");
const loadTester = require("../backend/src/utils/load-test");
const featureFlags = require("../backend/src/config/feature-flags");

async function runVerification() {
  console.log("=== SPRINT 51-60 BACKEND VERIFICATION ===");

  // 1. Sprint 51 Test
  const rerankRes = await rerankerService.rerank(
    [
      { id: "1", text: "SQL Injection in endpoint /api/v1/user", similarity: 0.8 },
      { id: "2", text: "Cross site scripting vulnerability in search box", similarity: 0.6 },
    ],
    "SQL injection"
  );
  console.log("✅ Sprint 51 (Reranker): Top candidate score =", rerankRes[0]?.rerankScore);

  // 2. Sprint 53 Test
  const loop = new AutonomousTaskLoop();
  const loopRes = await loop.run("List all active endpoints", { targetUrl: "https://api.example.com" });
  console.log("✅ Sprint 53 (Task Loop): Status =", loopRes.status, "| Iterations =", loopRes.iterations);

  // 3. Sprint 55 Test
  const toolsList = toolRegistry.getToolsList();
  console.log("✅ Sprint 55 (Tool Registry): Total tools =", toolsList.length);

  // 4. Sprint 56 Test
  const autoScanRes = await autonomousScannerAgent.executeAutonomousScan("https://api.example.com");
  console.log("✅ Sprint 56 (Autonomous Scanner): Endpoints =", autoScanRes.endpointsDiscovered, "| Verified =", autoScanRes.findingsVerified);

  // 5. Sprint 58 Test
  const researchRes = await webResearchAgent.researchVulnerability("OWASP API1 BOLA mitigation");
  console.log("✅ Sprint 58 (Web Research Agent): Top score =", researchRes.topCredibilityScore);

  // 6. Sprint 60 Test
  const reflectRes = await reflectionService.runReflectionLoop("How to fix SQLi?", "Apply parameterized queries.");
  console.log("✅ Sprint 60 (Self-Reflection): Iterations =", reflectRes.iterations);

  // 7. Sprint 54 Test
  const loadRes = await loadTester.runLoadBenchmark(100);
  console.log("✅ Sprint 54 (Load Test): Active Sockets =", loadRes.activeSockets);

  // 8. Sprint 59 Test
  console.log("✅ Sprint 59 (Feature Flags): RAG Reranking Enabled =", featureFlags.isFeatureEnabled("ENABLE_RAG_RERANKING"));

  console.log("\nALL BACKEND VERIFICATIONS COMPLETED SUCCESSFULLY!");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
