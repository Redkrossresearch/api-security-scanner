const { CopilotMemory } = require("./copilot.model");
const vectorDb = require("../llm/rag/vector.db");
const llmRegistry = require("../llm/llm.registry");

class MemoryService {
  /**
   * Add a fact to user memory
   */
  async saveMemory(userId, content, type = "fact") {
    console.log(`[memory-service] Saving memory for user ${userId}: "${content.slice(0, 50)}..."`);
    const embedding = await vectorDb.getEmbedding(content);
    
    return CopilotMemory.create({
      userId,
      type,
      text: content,
      category: type === "preference" ? "Preferences" : "Architectural",
      embedding,
    });
  }

  /**
   * Search user memories using cosine similarity (Sprint 48)
   */
  async retrieveMemories(userId, queryText, limit = 3) {
    const queryEmbedding = await vectorDb.getEmbedding(queryText);
    const memories = await CopilotMemory.find({ userId }).lean();

    if (memories.length === 0) return [];

    const scored = memories.map((m) => {
      let similarity = 0;
      if (m.embedding && m.embedding.length > 0) {
        similarity = vectorDb.cosineSimilarity(queryEmbedding, m.embedding);
      }
      return { ...m, similarity, content: m.text };
    });

    // Sort by similarity descending
    scored.sort((a, b) => b.similarity - a.similarity);

    return scored.slice(0, limit);
  }

  /**
   * Auto-extract preferences or facts from conversation turn (Sprint 47)
   */
  async autoExtractFacts(userId, userQuery, assistantResponse) {
    const prompt = `You are a Memory Extractor Agent.
Review the following user query and assistant response.
User: "${userQuery}"
Assistant: "${assistantResponse}"

Determine if the user disclosed any long-term preferences, facts about their tech stack, environment configurations, or policies.
If yes, extract them as concise, declarative fact statements (e.g. "User prefers using Node.js for backend services").
If no facts were disclosed, respond with an empty list.

Format your response exactly as JSON:
{
  "facts": ["extracted fact 1", "extracted fact 2"]
}`;

    try {
      const adapter = llmRegistry.getAdapter("openai");
      const res = await adapter.generate([{ role: "user", content: prompt }]);
      
      const jsonStart = res.content.indexOf("{");
      const jsonEnd = res.content.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const rawJson = res.content.slice(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(rawJson);
        const facts = parsed.facts || [];

        for (const fact of facts) {
          await this.saveMemory(userId, fact, "preference");
        }
      }
    } catch (e) {
      console.warn("[memory-service] Failed to auto-extract facts:", e.message);
    }
  }
}

module.exports = new MemoryService();
