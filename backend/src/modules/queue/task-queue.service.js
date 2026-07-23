/**
 * task-queue.service.js (Sprint 65 & 67 — Multi-Task Queue System & Dependency Sequence)
 * Extends task-graph parallel queue processing and sequence dependencies auto-triggering notification.service.js.
 */
const { dispatchScanNotification } = require("../settings/notification.service");

class TaskQueueService {
  constructor() {
    this.taskGraph = new Map();
  }

  async enqueueTaskGraph(parentTaskId, tasks = []) {
    console.log(`[TaskQueueService] Enqueueing multi-task graph for parent ID: ${parentTaskId} (${tasks.length} tasks)`);

    const graphState = {
      parentTaskId,
      tasks: tasks.map((t, idx) => ({
        taskId: `${parentTaskId}_sub_${idx + 1}`,
        name: t.name || `Task ${idx + 1}`,
        status: idx === 0 ? "running" : "pending",
        dependsOn: t.dependsOn || (idx > 0 ? `${parentTaskId}_sub_${idx}` : null),
        result: null,
      })),
      createdAt: new Date(),
    };

    this.taskGraph.set(parentTaskId, graphState);

    // Simulate parallel execution for initial independent tasks
    for (const task of graphState.tasks) {
      if (!task.dependsOn) {
        this.runTask(parentTaskId, task.taskId);
      }
    }

    return graphState;
  }

  async runTask(parentTaskId, taskId) {
    const graphState = this.taskGraph.get(parentTaskId);
    if (!graphState) return;

    const task = graphState.tasks.find((t) => t.taskId === taskId);
    if (!task) return;

    task.status = "running";
    console.log(`[TaskQueueService] Running task: ${task.name} (${task.taskId})`);

    await new Promise((resolve) => setTimeout(resolve, 150)); // Task execution delay

    task.status = "completed";
    task.result = `Successfully processed task ${task.name}`;

    // Check for dependent tasks that are ready to unblock
    const dependents = graphState.tasks.filter((t) => t.dependsOn === taskId && t.status === "pending");
    for (const dep of dependents) {
      this.runTask(parentTaskId, dep.taskId);
    }

    // If all tasks complete, dispatch completion notification
    const allCompleted = graphState.tasks.every((t) => t.status === "completed");
    if (allCompleted) {
      console.log(`[TaskQueueService] Task graph ${parentTaskId} completed cleanly. Triggering auto-notification...`);
      try {
        await dispatchScanNotification(
          { scanId: parentTaskId, targetUrl: "Multi-Task Queue System" },
          "Task Graph Completed",
          "All queued multi-task workflows finished processing successfully."
        );
      } catch (err) {
        /* notification fallback */
      }
    }
  }

  getTaskGraphStatus(parentTaskId) {
    return this.taskGraph.get(parentTaskId) || null;
  }
}

module.exports = new TaskQueueService();
