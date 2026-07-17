const llmRegistry = require("../llm.registry");

class LLMConsensusEngine {
  /**
   * Run consensus voting among 3 parallel providers
   */
  async runConsensus(messages, options = {}) {
    const providers = ["openai", "claude", "gemini"];
    console.log(`[llm-consensus] Launching consensus vote with providers: ${providers.join(", ")}`);

    const promises = providers.map(async (provider) => {
      try {
        const adapter = llmRegistry.getAdapter(provider);
        const result = await adapter.generate(messages, options);
        return { provider, success: true, content: result.content };
      } catch (err) {
        return { provider, success: false, error: err.message };
      }
    });

    const results = await Promise.all(promises);
    const successful = results.filter((r) => r.success);

    if (successful.length < 2) {
      // Fallback directly to registry if less than 2 succeeded
      const fallback = llmRegistry.getAdapter("openai");
      return fallback.generate(messages, options);
    }

    // Call a Judge model to evaluate consensus among successful responses
    return this.evaluateConsensusWithJudge(successful, messages, options);
  }

  /**
   * Evaluate consensus responses using a 4th LLM Judge
   */
  async evaluateConsensusWithJudge(responses, originalMessages, options = {}) {
    const judgeAdapter = llmRegistry.getAdapter("openrouter");
    
    const responsesBlock = responses
      .map((r, i) => `--- RESPONSE #${i + 1} (${r.provider}) ---\n${r.content}`)
      .join("\n\n");

    const judgePrompt = [
      {
        role: "system",
        content: `You are an expert Security Judge. Your job is to review multiple security analysis responses from different models, resolve conflicts, correct inaccuracies, and output a single, definitive, high-quality final security verdict. Include your brief reasoning explaining which model had the best analysis.`,
      },
      {
        role: "user",
        content: `Here are the candidate analyses:\n\n${responsesBlock}\n\nPlease issue the final consolidated verdict.`,
      },
    ];

    console.log(`[llm-consensus] Invoking OpenRouter Judge to resolve consensus tie-breaker`);
    const finalVerdict = await judgeAdapter.generate(judgePrompt, options);

    return {
      content: `### ⚖️ Consolidated Security Verdict (Consensus Judge)

${finalVerdict.content}

---
*Consensus participant contributions: ${responses.map((r) => r.provider).join(", ")}*`,
      model: "consensus-judge",
    };
  }

  /**
   * Execute AI Debate Mode: Agent 1 claims, Agent 2 counters, Judge decides
   */
  async runDebate(scanFinding, options = {}) {
    console.log(`[llm-debate] Starting security debate on finding: "${scanFinding.slice(0, 50)}..."`);

    const agent1 = llmRegistry.getAdapter("claude");
    const agent2 = llmRegistry.getAdapter("deepseek");
    const judge = llmRegistry.getAdapter("openrouter");

    // Round 1: Agent 1 claims
    const claimPrompt = [
      {
        role: "system",
        content: "You are Agent 1 (Security Pentester). Your goal is to explain why this security finding is highly critical and exploitable, providing payload details.",
      },
      {
        role: "user",
        content: `Analyze this scan finding: ${scanFinding}`,
      },
    ];
    const claimResult = await agent1.generate(claimPrompt, options);
    const claim = claimResult.content;

    // Round 2: Agent 2 counters (Debate)
    const counterPrompt = [
      {
        role: "system",
        content: "You are Agent 2 (Security Auditor). Your goal is to critique Agent 1's claim, identify if it could be a false positive, and point out missing context or assumptions.",
      },
      {
        role: "user",
        content: `Agent 1 claimed the following finding is critical:\n\n${claim}\n\nPlease provide your counter-argument or critique.`,
      },
    ];
    const counterResult = await agent2.generate(counterPrompt, options);
    const counter = counterResult.content;

    // Final Round: Judge issues verdict
    const judgePrompt = [
      {
        role: "system",
        content: "You are the Neutral Security Judge. Review the debate between Agent 1 and Agent 2, resolve the disagreement, and issue a final verdict confirming or dismissing the finding.",
      },
      {
        role: "user",
        content: `DEBATE TRANSCRIPT:\n\n[Agent 1 (Pentester)]:\n${claim}\n\n[Agent 2 (Auditor)]:\n${counter}\n\nEvaluate the debate and provide the final security decision.`,
      },
    ];
    const verdictResult = await judge.generate(judgePrompt, options);

    return {
      content: `## ⚔️ AI Security Debate Transcript

### 🔴 Agent 1 (Pentester Assertion)
${claim}

---

### 🔵 Agent 2 (Auditor Challenge)
${counter}

---

### ⚖️ Neutral Judge Final Verdict
${verdictResult.content}`,
      model: "debate-consensus",
      debateMessages: [
        { role: "SecurityPentester", text: claim },
        { role: "AuditorReviewer", text: counter },
        { role: "NeutralJudge", text: verdictResult.content }
      ]
    };
  }
}

module.exports = new LLMConsensusEngine();
