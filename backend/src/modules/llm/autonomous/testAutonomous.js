require("dotenv").config({ path: "../../../../.env" });
const autonomousLoop = require("./autonomous.loop");
const externalSources = require("../rag/external.sources");

async function runAutonomousTest() {
  console.log("=== Seeding Threat Libraries & Advisories ===");
  await externalSources.seedThreatCatalog();
  await externalSources.syncGitHubAdvisories();

  const taskId = `task-${Date.now()}`;
  const goal = "Verify SQL Injection on vulnerable API endpoint and generate a parameterized query remediation fix.";

  console.log("\n=== Starting Autonomous Loop Task ===");
  const promise = autonomousLoop.execute(taskId, goal, { maxIterations: 3 });

  // Wait briefly to let iteration 1 start and request risky approval
  await new Promise((r) => setTimeout(r, 2000));

  // Check task status
  let status = autonomousLoop.runningLoops[taskId];
  console.log(`Current Loop Status: ${status.status}`);
  console.log("Pending approvals queue keys:", Object.keys(autonomousLoop.approvalQueue));

  const pending = autonomousLoop.approvalQueue[taskId];
  if (pending) {
    console.log(`\n[HIL Gate] Detected pending checkpoint for risky action: "${pending.toolName}". Granting user approval...`);
    pending.resume(true); // Approve execution!
  }

  // Wait for the pipeline promise to resolve
  const result = await promise;
  console.log("\n==============================================");
  console.log("=== AUTONOMOUS LOOP COMPLETED RESULT ===");
  console.log("==============================================");
  console.log("Final Loop Status:", result.status);
  console.log("Final Loop Summary:\n", result.summary || "No summary provided.");
  console.log("\nTotal Steps Taken:\n", JSON.stringify(result.steps, null, 2));
}

runAutonomousTest().catch(console.error);
