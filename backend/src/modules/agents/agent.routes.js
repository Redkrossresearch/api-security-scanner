/**
 * agent.routes.js (Sprint 62 — Autonomous Agent API & Kill-Switch Endpoint)
 * REST Routes for Autonomous Agents management and manual kill-switch cancellation.
 */
const express = require("express");
const router = express.Router();
const AutonomousTaskLoop = require("./autonomous.loop");

// POST /api/agents/kill-switch
router.post("/kill-switch", (req, res) => {
  const { taskId } = req.body;
  if (!taskId) {
    return res.status(400).json({ success: false, message: "taskId is required" });
  }

  const success = AutonomousTaskLoop.killTask(taskId);
  if (success) {
    return res.status(200).json({
      success: true,
      message: `Autonomous task "${taskId}" safely terminated via Kill-Switch API.`,
    });
  }

  return res.status(444).json({
    success: false,
    message: `Task "${taskId}" not found in active running queue or already completed.`,
  });
});

module.exports = router;
