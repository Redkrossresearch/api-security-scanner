const express = require("express");
const router = express.Router();
const autonomousLoop = require("./autonomous.loop");

// 1. Trigger autonomous goal loop (Sprint 39)
router.post("/run", async (req, res) => {
  const { taskId, goal, maxIterations } = req.body;
  if (!taskId || !goal) {
    return res.status(400).json({ error: "taskId and goal are required." });
  }

  // Run async or sync depending on preference
  // Running async to avoid HTTP timeouts, responding with task creation acknowledgement
  autonomousLoop.execute(taskId, goal, { maxIterations: maxIterations || 5 })
    .then((result) => {
      console.log(`[autonomous-api] Loop finished for task: ${taskId}`, result);
    })
    .catch((err) => {
      console.error(`[autonomous-api] Loop crashed for task: ${taskId}:`, err.message);
    });

  return res.status(202).json({
    status: "accepted",
    message: "Autonomous execution loop started.",
    taskId,
  });
});

// 2. Submit human approval checkpoint (Sprint 45)
router.post("/approve", (req, res) => {
  const { taskId, approved } = req.body;
  if (!taskId || approved === undefined) {
    return res.status(400).json({ error: "taskId and approved boolean are required." });
  }

  const checkpoint = autonomousLoop.approvalQueue[taskId];
  if (!checkpoint) {
    return res.status(404).json({ error: "No pending checkpoint approval found for this taskId." });
  }

  checkpoint.resume(approved);
  return res.json({ status: "success", message: `Checkpoint decision processed: ${approved ? 'APPROVED' : 'REJECTED'}` });
});

// 3. Trigger loop emergency kill-switch (Sprint 46)
router.post("/kill", (req, res) => {
  const { taskId } = req.body;
  if (!taskId) {
    return res.status(400).json({ error: "taskId is required." });
  }

  const killed = autonomousLoop.kill(taskId);
  if (!killed) {
    return res.status(404).json({ error: "Task loop not found or not active." });
  }

  return res.json({ status: "success", message: "Kill switch triggered successfully." });
});

// 4. Retrieve task loop status
router.get("/status/:taskId", (req, res) => {
  const { taskId } = req.params;
  const loop = autonomousLoop.runningLoops[taskId];
  if (!loop) {
    return res.status(404).json({ error: "Task not found." });
  }
  return res.json({
    taskId,
    goal: loop.goal,
    status: loop.status,
    steps: loop.steps,
    pendingApproval: !!autonomousLoop.approvalQueue[taskId],
  });
});

module.exports = router;
