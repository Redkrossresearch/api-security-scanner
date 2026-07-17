require("dotenv").config({ path: "../../../.env" });
const mongoose = require("mongoose");
const memoryService = require("../copilot/memory.service");
const workflowEngine = require("./workflow.engine");
const Workflow = require("./workflow.model");

async function runTests() {
  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/api-security-scanner";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB successfully.");

  const testUserId = new mongoose.Types.ObjectId();

  console.log("\n=== Testing Memory Store and Retrieval ===");
  await memoryService.saveMemory(testUserId, "User's infrastructure is deployed on AWS ECS container hosts.", "preference");
  await memoryService.saveMemory(testUserId, "Security team mandates strictly JWT token authorization headers.", "preference");

  const queryText = "Where is the staging server deployed and how do we authorize?";
  console.log(`Querying memory for: "${queryText}"`);
  const matches = await memoryService.retrieveMemories(testUserId, queryText, 2);
  console.log("Memory Retrieval Matches:");
  matches.forEach((m, i) => console.log(`[${i + 1}] Similarity: ${m.similarity.toFixed(4)} | Content: ${m.text}`));

  console.log("\n=== Testing Workflow Building and Execution Plan ===");
  // Create a mock workflow configuration
  const newWorkflow = await Workflow.create({
    name: "Automated Scan & Warn Workflow",
    userId: testUserId,
    steps: [
      {
        id: "step1",
        stepType: "scan",
        config: { targetUrl: "http://localhost:5000/api" },
        dependsOn: [],
      },
      {
        id: "step2",
        stepType: "notify",
        config: { channel: "slack" },
        dependsOn: ["step1"],
      },
    ],
  });
  console.log(`Created workflow: "${newWorkflow.name}" with ID: ${newWorkflow._id}`);

  console.log("\nTriggering workflow execution...");
  const triggerResult = await workflowEngine.executeWorkflow(
    newWorkflow._id,
    testUserId,
    "Vulnerable MongoDB exposed in web logs endpoint."
  );
  console.log("Trigger Result:", triggerResult);

  // Poll status briefly to inspect updates
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r, 4000));
    const runState = workflowEngine.activeRuns[triggerResult.runId];
    console.log(`\n--- Run Status Update [Time: ${(i+1)*4}s] ---`);
    console.log(`Overall Run Status: ${runState.status}`);
    runState.steps.forEach((s) => console.log(`Step ID: ${s.id} | Status: ${s.status}`));
    if (runState.status === "completed" || runState.status === "failed") {
      break;
    }
  }

  // Cleanup database
  await Workflow.findByIdAndDelete(newWorkflow._id);
  const { CopilotMemory } = require("../copilot/copilot.model");
  await CopilotMemory.deleteMany({ userId: testUserId });
  await mongoose.disconnect();
  console.log("\nTests complete and database cleaned.");
}

runTests().catch(console.error);
