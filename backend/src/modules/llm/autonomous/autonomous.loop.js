const toolRegistry = require("./tool.registry");
const llmRegistry = require("../llm.registry");

class AutonomousExecutionLoop {
  constructor() {
    this.runningLoops = {}; // taskId -> { goal, status, steps, killFlag }
    this.approvalQueue = {}; // taskId -> { toolName, params, resumeCallback }
  }

  /**
   * Run the main Goal -> Plan -> Act -> Observe -> Reflect autonomous loop
   */
  async execute(taskId, goal, options = {}) {
    const maxIterations = options.maxIterations || 5;
    this.runningLoops[taskId] = {
      goal,
      status: "running",
      steps: [],
      killFlag: false,
    };

    console.log(`[autonomous-loop] Starting task: ${taskId} | Goal: "${goal}"`);

    const loopState = this.runningLoops[taskId];

    for (let i = 1; i <= maxIterations; i++) {
      // 1. Check Kill-switch
      if (loopState.killFlag) {
        loopState.status = "killed";
        console.warn(`[autonomous-loop] Task ${taskId} terminated via kill-switch.`);
        return { status: "killed", steps: loopState.steps };
      }

      console.log(`[autonomous-loop] Iteration ${i}/${maxIterations}`);

      // 2. Planning: Ask model to pick next action based on current progress
      const decision = await this.decideNextAction(goal, loopState.steps);
      const { toolName, params, completed, summary } = decision;

      if (completed) {
        // Self-Reflection check completed!
        loopState.status = "completed";
        console.log(`[autonomous-loop] Goal achieved: "${summary}"`);
        return {
          status: "completed",
          summary,
          steps: loopState.steps,
        };
      }

      // 3. Tool execution validation
      const tool = toolRegistry.getTool(toolName);
      if (!tool) {
        loopState.steps.push({
          iteration: i,
          action: `Call tool "${toolName}"`,
          observation: `Error: Tool "${toolName}" not found in registry.`,
        });
        continue;
      }

      // 4. Human-in-the-loop Gate (Sprint 45)
      if (tool.isRisky && !options.bypassApproval) {
        loopState.status = "pending_approval";
        console.log(`[autonomous-loop] Task ${taskId} suspended: Requires approval for risky tool ${toolName}`);
        
        return new Promise((resolve) => {
          this.approvalQueue[taskId] = {
            toolName,
            params,
            resume: async (approved) => {
              delete this.approvalQueue[taskId];
              if (!approved) {
                loopState.steps.push({
                  iteration: i,
                  action: `Execute tool "${toolName}"`,
                  observation: "User rejected permission to run this action.",
                });
                loopState.status = "running";
                // Resume loop from next iteration
                const remaining = await this.execute(taskId, goal, {
                  ...options,
                  maxIterations: maxIterations - i,
                  bypassApproval: false,
                });
                resolve(remaining);
              } else {
                loopState.status = "running";
                // Execute tool
                const observation = await this.runToolSafety(tool, params);
                loopState.steps.push({
                  iteration: i,
                  action: `Execute tool "${toolName}"`,
                  observation: JSON.stringify(observation),
                });
                // Resume loop
                const remaining = await this.execute(taskId, goal, {
                  ...options,
                  maxIterations: maxIterations - i,
                  bypassApproval: true, // Bypass check for this specific resumed action
                });
                resolve(remaining);
              }
            },
          };
        });
      }

      // 5. Execute safe tool
      const observation = await this.runToolSafety(tool, params);
      loopState.steps.push({
        iteration: i,
        action: `Execute tool "${toolName}"`,
        observation: JSON.stringify(observation),
      });

      // Self-reflection verification (Sprint 43)
      const reflection = await this.reflectOnProgress(goal, loopState.steps);
      if (reflection.goalAchieved) {
        loopState.status = "completed";
        return {
          status: "completed",
          summary: reflection.summary,
          steps: loopState.steps,
        };
      }
    }

    loopState.status = "max_iterations_reached";
    return {
      status: "max_iterations",
      message: "Reached cost/iteration ceilings before goal could be verified.",
      steps: loopState.steps,
    };
  }

  async runToolSafety(tool, params) {
    try {
      return await tool.handler(params);
    } catch (e) {
      return { error: e.message };
    }
  }

  /**
   * Dynamic next action selection using LLM
   */
  async decideNextAction(goal, steps) {
    const adapter = llmRegistry.getAdapter("openai");
    const prompt = `You are the Brain of an Autonomous Pentester Agent.
Your current goal: "${goal}"

Execution history so far:
${JSON.stringify(steps, null, 2)}

Available Tools:
- web_search: { query: string } (Search threat intelligence or CVE details)
- query_rag: { query: string } (Retrieve local scanner database details)
- generate_fix: { language: string, code: string, flaw: string } (Create patch snippets)
- run_exploitation_verification: { url: string, payload: string } (Verify vulnerability with active payload - RISKY)

Choose the next action. Format your response exactly as JSON:
{
  "toolName": "web_search" | "query_rag" | "generate_fix" | "run_exploitation_verification" | "none",
  "params": {},
  "completed": true | false,
  "summary": "Short explanation of findings if completed, otherwise explanation of next step"
}`;

    try {
      const res = await adapter.generate([{ role: "user", content: prompt }]);
      // Parse JSON response safely
      const jsonStart = res.content.indexOf("{");
      const jsonEnd = res.content.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const rawJson = res.content.slice(jsonStart, jsonEnd + 1);
        return JSON.parse(rawJson);
      }
    } catch (e) {}

    // Fallback default
    return { toolName: "query_rag", params: { query: goal }, completed: false, summary: "Fallback query" };
  }

  /**
   * Self-Critique / Reflection pass (Sprint 43)
   */
  async reflectOnProgress(goal, steps) {
    const adapter = llmRegistry.getAdapter("openai");
    const prompt = `Review the progress of the autonomous agent.
Goal: "${goal}"
Steps taken:
${JSON.stringify(steps, null, 2)}

Has the goal been completely achieved? Output exactly JSON:
{
  "goalAchieved": true | false,
  "summary": "If achieved, compile final security verification report summary, else explain what is missing"
}`;

    try {
      const res = await adapter.generate([{ role: "user", content: prompt }]);
      const jsonStart = res.content.indexOf("{");
      const jsonEnd = res.content.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const rawJson = res.content.slice(jsonStart, jsonEnd + 1);
        return JSON.parse(rawJson);
      }
    } catch (e) {}

    return { goalAchieved: false, summary: "Unable to confirm" };
  }

  /**
   * Trigger emergency kill-switch abort (Sprint 46)
   */
  kill(taskId) {
    if (this.runningLoops[taskId]) {
      this.runningLoops[taskId].killFlag = true;
      return true;
    }
    return false;
  }
}

module.exports = new AutonomousExecutionLoop();
