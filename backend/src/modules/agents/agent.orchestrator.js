const securityAgent = require("./security.agent");
const cveAgent = require("./cve.agent");
const codereviewAgent = require("./codereview.agent");
const reviewerAgent = require("./reviewer.agent");
const documentationAgent = require("./documentation.agent");
const decisionAgent = require("./decision.agent");

class AgentOrchestrator {
  /**
   * Run the multi-agent orchestration DAG pipeline
   */
  async executePipeline(finding, userId = null) {
    const outputs = {};
    const steps = [
      { id: "step1", name: "SecurityPentester", agent: securityAgent },
      { id: "step2", name: "CVEAnalyst", agent: cveAgent },
      { id: "step3", name: "CodeReviewAgent", agent: codereviewAgent },
      { id: "step4", name: "AuditorReviewer", agent: reviewerAgent },
      { id: "step5", name: "DocumentationAgent", agent: documentationAgent },
      { id: "step6", name: "FinalDecisionAgent", agent: decisionAgent },
    ];

    console.log(`[orchestrator] Starting multi-agent pipeline for finding: "${finding.slice(0, 50)}..."`);
    
    // Broadcast live socket updates if active socket server exists
    const emitEvent = (eventName, payload) => {
      try {
        const { getIo } = require("../../sockets/socket.server");
        const io = getIo();
        if (userId) {
          const room = `user:${userId}`;
          io.to(room).emit(eventName, payload);
          console.log(`[orchestrator-socket] Emitted ${eventName} to room: ${room}`);
        }
      } catch (e) {
        // Safe fallback if Socket.IO is not initialized
      }
    };

    for (const step of steps) {
      console.log(`[orchestrator] Executing step: ${step.name}`);
      emitEvent("agent:started", { agent: step.name });
      emitEvent("agent:thinking", { agent: step.name });

      // Gather cumulative context context for execution
      const context = {
        scanFinding: finding,
        previousStepOutputs: outputs,
      };

      const result = await step.agent.run(context);
      
      if (result.success) {
        outputs[step.name] = result.output;
        emitEvent("agent:result", { agent: step.name, output: result.output });
      } else {
        console.warn(`[orchestrator] Step ${step.name} failed: ${result.error}`);
        outputs[step.name] = `Error: ${result.error}`;
        emitEvent("agent:result", { agent: step.name, error: result.error });
      }
    }

    console.log("[orchestrator] Multi-agent execution pipeline complete!");

    return {
      success: true,
      finalReport: outputs["FinalDecisionAgent"],
      fullTranscript: outputs,
    };
  }
}

module.exports = new AgentOrchestrator();
