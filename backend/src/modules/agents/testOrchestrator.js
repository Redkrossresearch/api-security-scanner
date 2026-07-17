require("dotenv").config({ path: "../../.env" });
const agentOrchestrator = require("./agent.orchestrator");

async function testOrchestration() {
  console.log("=== Launching Multi-Agent System Verification ===");
  const finding = "Found vulnerable endpoint exposing active MongoDB connection parameters directly inside web logs.";

  try {
    const result = await agentOrchestrator.executePipeline(finding);
    console.log("\n=============================================");
    console.log("=== ORCHESTRATION PIPELINE SUMMARY RESULT ===");
    console.log("=============================================");
    console.log(result.finalReport);
  } catch (err) {
    console.error("Orchestration pipeline execution error:", err.message);
  }
}

testOrchestration().catch(console.error);
