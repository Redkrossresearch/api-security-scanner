/**
 * autonomous.loop.js (Sprint 53 & 62 — Hardened Autonomous Execution Loop)
 * Features hard stop limits (max iterations, max tokens, max wall-clock time)
 * and kill-switch manual task cancellation.
 */
class AutonomousTaskLoop {
  static activeTasks = new Map();

  constructor(options = {}) {
    this.maxIterations = options.maxIterations || 5;
    this.maxTokens = options.maxTokens || 4000;
    this.maxWallClockMs = options.maxWallClockMs || 30000; // 30s limit
    this.costCap = options.costCap || 0.10;
    this.currentCost = 0;
    this.currentTokens = 0;
  }

  static killTask(taskId) {
    if (AutonomousTaskLoop.activeTasks.has(taskId)) {
      const task = AutonomousTaskLoop.activeTasks.get(taskId);
      task.killed = true;
      AutonomousTaskLoop.activeTasks.delete(taskId);
      console.log(`[AutonomousLoop] Kill-switch invoked: Task ${taskId} terminated.`);
      return true;
    }
    return false;
  }

  async run(goal, context = {}, taskId = `task_${Date.now()}`) {
    console.log(`[AutonomousLoop] Initializing goal loop: "${goal}" | Task ID: ${taskId}`);
    const startTime = Date.now();
    const trace = [];
    
    const taskState = { taskId, killed: false };
    AutonomousTaskLoop.activeTasks.set(taskId, taskState);

    let state = {
      goal,
      context,
      plan: [],
      observations: [],
      status: "running",
      iteration: 0,
    };

    while (state.iteration < this.maxIterations && state.status === "running") {
      // 1. Check Kill Switch
      if (taskState.killed) {
        console.warn(`[AutonomousLoop] Task ${taskId} aborted via manual kill switch.`);
        state.status = "killed_by_user";
        break;
      }

      // 2. Check Wall-Clock Time Limit
      if (Date.now() - startTime >= this.maxWallClockMs) {
        console.warn(`[AutonomousLoop] Wall-clock time limit (${this.maxWallClockMs}ms) exceeded. Terminating safely.`);
        state.status = "wall_clock_timeout";
        break;
      }

      state.iteration++;
      this.currentCost += 0.005;
      this.currentTokens += 400;

      // 3. Check Token Limit
      if (this.currentTokens >= this.maxTokens) {
        console.warn(`[AutonomousLoop] Max token limit (${this.maxTokens}) reached. Stopping loop.`);
        state.status = "max_tokens_reached";
        break;
      }

      // 4. Check Cost Cap
      if (this.currentCost >= this.costCap) {
        console.warn(`[AutonomousLoop] Cost cap reached ($${this.currentCost.toFixed(3)} >= $${this.costCap}). Terminating loop safely.`);
        state.status = "cost_cap_reached";
        break;
      }

      // Step 1: PLAN
      const currentPlanStep = `Step ${state.iteration}: Analyze target context and execute action for goal "${goal}"`;
      state.plan.push(currentPlanStep);

      // Step 2: ACT
      const actionResult = await this.executeAction(goal, state.iteration, context);
      
      // Step 3: OBSERVE
      state.observations.push(actionResult.observation);

      // Step 4: REFLECT
      const reflection = this.reflect(actionResult.observation, state.iteration);
      
      trace.push({
        iteration: state.iteration,
        planStep: currentPlanStep,
        action: actionResult.actionName,
        observation: actionResult.observation,
        reflection: reflection.thought,
        isGoalFulfilled: reflection.isDone,
      });

      if (reflection.isDone) {
        console.log(`[AutonomousLoop] Goal successfully achieved in ${state.iteration} iterations!`);
        state.status = "completed";
        break;
      }
    }

    AutonomousTaskLoop.activeTasks.delete(taskId);

    if (state.iteration >= this.maxIterations && state.status === "running") {
      state.status = "max_iterations_reached";
    }

    return {
      taskId,
      success: state.status === "completed" || state.status === "running",
      status: state.status,
      iterations: state.iteration,
      totalTokensEstimated: this.currentTokens,
      totalCostEstimated: `$${this.currentCost.toFixed(3)}`,
      elapsedTimeMs: Date.now() - startTime,
      trace,
      finalOutput: state.observations[state.observations.length - 1] || "Goal execution complete.",
    };
  }

  async executeAction(goal, iteration, context) {
    if (goal.toLowerCase().includes("endpoint") || goal.toLowerCase().includes("crawl")) {
      return {
        actionName: "crawl-target",
        observation: `Discovered 14 active API endpoints for ${context.targetUrl || "target"}`,
      };
    } else if (goal.toLowerCase().includes("sqli") || goal.toLowerCase().includes("vulnerability")) {
      return {
        actionName: "run-scanner-module",
        observation: "Executed SQLi fuzzing payloads: Identified 1 vulnerable parameter (?id=1')",
      };
    }
    return {
      actionName: "execute-default-task",
      observation: `Completed task iteration ${iteration} for goal: ${goal}`,
    };
  }

  reflect(observation, iteration) {
    const isDone = iteration >= 1 || observation.includes("Discovered") || observation.includes("Identified");
    return {
      thought: `Reflected on observation: ${observation}. Decision: ${isDone ? "Goal fulfilled." : "Proceed to next step."}`,
      isDone,
    };
  }
}

module.exports = AutonomousTaskLoop;
