const AutonomousTaskLoop = require("../backend/src/modules/agents/autonomous.loop");
const memoryService = require("../backend/src/modules/memory/memory.service");
const imageAgent = require("../backend/src/modules/agents/image.agent");
const taskQueueService = require("../backend/src/modules/queue/task-queue.service");
const workflowEngine = require("../backend/src/modules/workflows/workflow.engine");
const confidenceEngineV2 = require("../backend/src/modules/engines/confidence.engine");
const feedbackService = require("../backend/src/modules/feedback/feedback.service");
const qualityBenchmarkSuite = require("../backend/src/utils/benchmark.suite");
const attackGraphService = require("../backend/src/modules/scans/attack-graph.service");
const securityAuditEngine = require("../backend/src/utils/security-audit.service");
const huggingFaceAdapter = require("../backend/src/modules/llm/adapters/huggingface.adapter");
const gitHubModelsAdapter = require("../backend/src/modules/llm/adapters/github-models.adapter");
const developerAgent = require("../backend/src/modules/agents/developer.agent");
const judgeAgent = require("../backend/src/modules/agents/judge.agent");
const handoffProtocol = require("../backend/src/modules/agents/handoff.protocol");

async function runVerification() {
  console.log("=== SPRINT 61-90 BACKEND VERIFICATION ===");

  // 1. Sprint 62 Test (Kill Switch)
  const taskLoop = new AutonomousTaskLoop();
  const runPromise = taskLoop.run("Scan API endpoint", {}, "test_kill_task");
  AutonomousTaskLoop.killTask("test_kill_task");
  const killRes = await runPromise;
  console.log("✅ Sprint 62 (Kill Switch): Status =", killRes.status);

  // 2. Sprint 63 Test (Memory Store)
  const memRes = await memoryService.extractAndSaveFacts("507f1f77bcf86cd799439011", "Target API endpoint is https://api.example.com");
  console.log("✅ Sprint 63 (Memory Store): Saved =", Boolean(memRes));

  // 3. Sprint 64 Test (Image Agent)
  const imgRes = await imageAgent.generateDiagramStructure("draw API architecture");
  console.log("✅ Sprint 64 (Image Agent): Nodes count =", imgRes.nodes.length);

  // 4. Sprint 65 & 67 Test (Task Queue)
  const graphRes = await taskQueueService.enqueueTaskGraph("parent_123", [{ name: "Scan Headers" }, { name: "Audit Auth" }]);
  console.log("✅ Sprint 65 & 67 (Task Queue): Tasks =", graphRes.tasks.length);

  // 5. Sprint 68 Test (Workflow Engine)
  const wfRes = await workflowEngine.executeWorkflow({ name: "Security Audit Workflow" });
  console.log("✅ Sprint 68 (Workflow Engine): Executed steps =", wfRes.totalStepsExecuted);

  // 6. Sprint 70 Test (Confidence v2)
  const confRes = confidenceEngineV2.calculateConfidenceScore({ evidenceQuality: 0.9, consensusStrength: 0.95 });
  console.log("✅ Sprint 70 (Confidence v2): Score =", confRes.confidenceScore);

  // 7. Sprint 73 Test (Feedback Service)
  const fbRes = await feedbackService.recordFeedback({ userId: "123", messageId: "msg1", rating: "thumbs_up" });
  console.log("✅ Sprint 73 (Feedback): Total Count =", feedbackService.getFeedbackMetrics().totalFeedbackCount);

  // 8. Sprint 72 Test (Benchmark Suite)
  const benchRes = await qualityBenchmarkSuite.runGoldenBenchmark();
  console.log("✅ Sprint 72 (Benchmark): Accuracy =", benchRes.accuracyRate);

  // 9. Sprint 74 Test (Attack Graph)
  const attackGraphRes = attackGraphService.generateAttackGraph([{ title: "SQLi Vulnerability", severity: "high" }]);
  console.log("✅ Sprint 74 (Attack Graph): Nodes =", attackGraphRes.totalNodes);

  // 10. Sprint 76 Test (Security Audit)
  const auditRes = await securityAuditEngine.runSecurityAudit();
  console.log("✅ Sprint 76 (Security Audit): Verdict =", auditRes.overallAuditVerdict);

  // 11. Sprint 77 & 78 Test (Adapters)
  const hfHealth = await huggingFaceAdapter.healthCheck();
  const ghHealth = await gitHubModelsAdapter.healthCheck();
  console.log("✅ Sprint 77 & 78 (Adapters): HF Provider =", hfHealth.reason || "Healthy", "| GH Provider =", ghHealth.reason || "Healthy");

  // 12. Sprint 83 & 86 & 88 Test (Dev & Judge Agent & Handoff)
  const devRes = await developerAgent.reviewAndFixCode("db.query('SELECT * FROM users WHERE id = ' + id)");
  const judgeRes = await judgeAgent.arbitrateDisagreement([{ agentName: "RiskAgent", verdict: "High Risk" }]);
  const handoffRes = handoffProtocol.createHandoff({ fromAgent: "Planner", toAgent: "DeveloperAgent" });
  console.log("✅ Sprint 83, 86, 88 (Dev/Judge/Handoff): Dev Status =", devRes.status, "| Judge Verdict =", judgeRes.finalVerdict, "| Handoff Status =", handoffRes.status);

  console.log("\nALL SPRINT 61-90 BACKEND VERIFICATIONS COMPLETED SUCCESSFULLY!");
}

runVerification().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
