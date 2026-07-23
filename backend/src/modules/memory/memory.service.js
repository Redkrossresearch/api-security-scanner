/**
 * memory.service.js (Sprint 63 — Long-Term Memory Service & Auto-Extraction)
 * Automatically extracts facts/preferences from conversations and retrieves persistent context.
 */
const Memory = require("./memory.model");

class MemoryService {
  constructor() {
    this.inMemoryStore = new Map(); // Fallback when MongoDB is not connected
  }

  async saveMemory(userId, type, content, metadata = {}) {
    try {
      if (Memory.db && Memory.db.readyState === 1) {
        return await Memory.create({ userId, type, content, metadata });
      }
    } catch (e) {
      /* Fallback below */
    }

    const key = `${userId.toString()}_${type}`;
    const list = this.inMemoryStore.get(key) || [];
    const memItem = { id: `mem_${Date.now()}`, userId, type, content, metadata, createdAt: new Date() };
    list.push(memItem);
    this.inMemoryStore.set(key, list);
    console.log(`[MemoryService] Saved long-term memory (${type}): "${content.slice(0, 40)}..."`);
    return memItem;
  }

  async extractAndSaveFacts(userId, text) {
    if (!text || text.length < 15) return null;

    // Detect preferences & facts (e.g. "I prefer dark mode", "Always use Python", "Target domain is example.com")
    const lower = text.toLowerCase();
    if (lower.includes("prefer") || lower.includes("always use") || lower.includes("my environment")) {
      return await this.saveMemory(userId, "preference", text, { autoExtracted: true });
    } else if (lower.includes("target") || lower.includes("api endpoint") || lower.includes("db host")) {
      return await this.saveMemory(userId, "fact", text, { autoExtracted: true });
    }
    return null;
  }

  async getUserMemories(userId, type = null) {
    try {
      if (Memory.db && Memory.db.readyState === 1) {
        const filter = { userId };
        if (type) filter.type = type;
        return await Memory.find(filter).sort({ createdAt: -1 }).lean();
      }
    } catch (e) {
      /* Fallback below */
    }

    const all = [];
    for (const [k, list] of this.inMemoryStore.entries()) {
      if (k.startsWith(userId.toString())) {
        all.push(...list);
      }
    }
    if (type) return all.filter((m) => m.type === type);
    return all;
  }
}

module.exports = new MemoryService();
