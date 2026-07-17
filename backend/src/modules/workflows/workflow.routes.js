const express = require("express");
const router = express.Router();
const Workflow = require("./workflow.model");
const workflowEngine = require("./workflow.engine");
const protect = require("../../middleware/auth.middleware"); // auth checks safety

// 1. Create / Save Workflow (Sprint 51)
router.post("/", protect, async (req, res) => {
  const { name, steps } = req.body;
  if (!name || !steps || !Array.isArray(steps)) {
    return res.status(400).json({ error: "name and steps array are required." });
  }

  try {
    const workflow = await Workflow.create({
      name,
      userId: req.user._id,
      steps,
    });
    return res.status(201).json(workflow);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. List user workflows
router.get("/", protect, async (req, res) => {
  try {
    const list = await Workflow.find({ userId: req.user._id });
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Trigger workflow run (Sprint 51)
router.post("/trigger/:id", protect, async (req, res) => {
  const { id } = req.params;
  const { initialInput } = req.body;

  try {
    const runStatus = await workflowEngine.executeWorkflow(
      id,
      req.user._id,
      initialInput || "Sample scan target details."
    );
    return res.json(runStatus);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Retrieve running status of execution graph
router.get("/run/:runId", protect, (req, res) => {
  const { runId } = req.params;
  const run = workflowEngine.activeRuns[runId];
  if (!run) {
    return res.status(404).json({ error: "Workflow run execution not found." });
  }
  return res.json(run);
});

// 5. Delete workflow configuration
router.delete("/:id", protect, async (req, res) => {
  const { id } = req.params;
  try {
    await Workflow.findOneAndDelete({ _id: id, userId: req.user._id });
    return res.json({ status: "success", message: "Workflow configuration deleted." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
