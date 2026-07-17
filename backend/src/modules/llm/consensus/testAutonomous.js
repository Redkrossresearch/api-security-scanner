require("dotenv").config({ path: "../../../../.env" });
const loop = require("../autonomous/autonomous.loop");

async function runTest() {
  console.log("=== Testing Autonomous Agents & Web Research (Phase 7) ===");

  const taskId = `task-verify-${Date.now()}`;
  
  // 1. Test running autonomous loop (mocking decision path returns to trigger none / completed quickly)
  console.log("\nTriggering Autonomous Execution Loop...");
  const result = await loop.execute(taskId, "Identify SQL injection and generate patch.", {
    maxIterations: 2,
    bypassApproval: true // ignore risky checks to run quick trace
  });
  console.log("Execution Result Status:", result.status);

  // 2. Test Kill-switch triggers
  console.log("\nTesting Emergency Kill-switch triggers...");
  const taskKillId = `task-kill-${Date.now()}`;
  loop.runningLoops[taskKillId] = {
    goal: "Infinite search logs scan",
    status: "running",
    steps: [],
    killFlag: false
  };

  const killed = loop.kill(taskKillId);
  console.log(`Kill-switch tripped state returned: ${killed}`);
  const resultKilled = await loop.execute(taskKillId, "Infinite search logs scan", { maxIterations: 1 });
  console.log("Post-kill execution loop status:", resultKilled.status);

  console.log("=== Phase 7 autonomous agents checks complete ===");
}

runTest().catch(console.error);
