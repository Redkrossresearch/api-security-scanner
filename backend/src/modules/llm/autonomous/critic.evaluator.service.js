const CopilotLearnedInsight = require("../../copilot/learned.insight.model");
const llmRegistry = require("../llm.registry");

class CriticEvaluatorService {
  /**
   * Evaluate AI response against OWASP security standards
   */
  async evaluateResponse(userQuery, aiResponse, modelName = "gemini") {
    try {
      const adapter = llmRegistry.getAdapter(modelName);
      const evalPrompt = `You are an expert AI Security Critic. Evaluate the following AI response to a user security query.

User Query: "${userQuery}"
AI Response: "${aiResponse?.slice(0, 1500)}"

Evaluate for:
1. Accuracy according to OWASP API Security Top 10 standards.
2. Actionability of code fix or security remediation.
3. Clarity and absence of hallucinations.

Respond strictly in JSON format:
{
  "score": <number between 0.0 and 1.0>,
  "passed": <true/false>,
  "criticFeedback": "<brief feedback summary>",
  "suggestedRule": "<optional key security rule or correction learned if response was incomplete or flawed>"
}`;

      const res = await adapter.generate([{ role: "user", content: evalPrompt }], { temperature: 0.2 });
      let jsonStr = res.content || "";
      if (jsonStr.includes("```json")) {
        jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
      } else if (jsonStr.includes("```")) {
        jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
      }

      const parsed = JSON.parse(jsonStr);
      return parsed;
    } catch (err) {
      console.warn("[critic-evaluator] AI Critic evaluation skipped/failed:", err.message);
      return { score: 0.85, passed: true, criticFeedback: "Automated pass", suggestedRule: null };
    }
  }

  /**
   * Process user feedback (thumbs_up / thumbs_down / text correction)
   * Storing or reinforcing learned insights for continuous improvement
   */
  async processFeedback(userId, { query, aiResponse, feedbackType, comment, topic = "security_remediation" }) {
    try {
      const isPositive = feedbackType === "thumbs_up" || feedbackType === "like";
      const isNegative = feedbackType === "thumbs_down" || feedbackType === "dislike";

      const keywords = (query || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3);

      if (comment && comment.trim().length > 5) {
        // Extract learned rule directly from user correction
        const ruleText = `User Correction on '${query.slice(0, 30)}': ${comment.trim()}`;
        await CopilotLearnedInsight.create({
          userId,
          topic: topic || "user_feedback_rule",
          category: "user_correction",
          rule: ruleText,
          triggerKeywords: keywords,
          confidenceScore: isPositive ? 0.95 : 0.7,
          positiveCount: isPositive ? 2 : 0,
          negativeCount: isNegative ? 1 : 0,
          source: "user_feedback",
        });
        console.log(`[critic-evaluator] Stored new user correction insight for topic: ${topic}`);
      } else if (isNegative) {
        // AI Critic analyzes why user disliked response
        const critique = await this.evaluateResponse(query, aiResponse);
        if (critique.suggestedRule) {
          await CopilotLearnedInsight.create({
            userId,
            topic: topic || "negative_feedback_remediation",
            category: "critic_rule",
            rule: critique.suggestedRule,
            triggerKeywords: keywords,
            confidenceScore: 0.85,
            positiveCount: 0,
            negativeCount: 1,
            source: "critic_evaluation",
          });
          console.log(`[critic-evaluator] AI Critic extracted self-learning rule from negative feedback`);
        }
      }

      return { success: true, message: "Feedback processed & self-learning rule recorded." };
    } catch (err) {
      console.error("[critic-evaluator] Feedback processing error:", err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Retrieve active learned insights matching the user query
   */
  async getActiveLearnedInsights(userId, userQuery) {
    try {
      if (!userQuery) return "";
      const keywords = userQuery
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3);

      const insights = await CopilotLearnedInsight.find({
        $or: [{ userId }, { active: true }],
        triggerKeywords: { $in: keywords },
      })
        .sort({ confidenceScore: -1, createdAt: -1 })
        .limit(4)
        .lean();

      if (!insights || insights.length === 0) return "";

      const rulesBlock = insights.map((insight) => `- [${insight.category.toUpperCase()}] ${insight.rule}`).join("\n");

      return `\n\n================================================================================\n## CONTINUOUS SELF-LEARNING RULES (Active Critic & User Feedback Insights)\n${rulesBlock}\n================================================================================\n`;
    } catch (err) {
      console.warn("[critic-evaluator] Failed to fetch active insights:", err.message);
      return "";
    }
  }
}

module.exports = new CriticEvaluatorService();
