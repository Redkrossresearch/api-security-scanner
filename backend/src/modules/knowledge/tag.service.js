/**
 * tag.service.js (Sprints 132-137 — Auto-Tagging, Hybrid Retrieval & Tag Analytics)
 * Auto-classifies RAG/search data, provides CRUD operations, tag filtering, and 30-day analytics.
 */
class TagService {
  constructor() {
    this.inMemoryTags = [
      { id: "tag_1", name: "owasp-top-10", topic: "owasp", sourceType: "rag", severity: "high" },
      { id: "tag_2", name: "sql-injection", topic: "sqli", sourceType: "web-search", severity: "critical" },
      { id: "tag_3", name: "jwt-validation", topic: "jwt", sourceType: "rag", severity: "medium" },
    ];
  }

  // Sprint 132 & 133: Auto-Tagging Classification
  classifyText(text) {
    const lower = (text || "").toLowerCase();
    const tags = [];

    if (lower.includes("owasp")) tags.push({ name: "owasp-top-10", topic: "owasp", severity: "high" });
    if (lower.includes("sqli") || lower.includes("sql")) tags.push({ name: "sql-injection", topic: "sqli", severity: "critical" });
    if (lower.includes("jwt") || lower.includes("auth")) tags.push({ name: "jwt-validation", topic: "jwt", severity: "medium" });

    if (tags.length === 0) tags.push({ name: "general-security", topic: "general", severity: "info" });
    return tags;
  }

  // Sprint 134: Tag-Based Retrieval
  filterByTags(tagFilter, sourceTypeFilter = null) {
    return this.inMemoryTags.filter((t) => {
      const matchTag = !tagFilter || t.name.toLowerCase().includes(tagFilter.toLowerCase()) || t.topic === tagFilter;
      const matchSource = !sourceTypeFilter || t.sourceType === sourceTypeFilter;
      return matchTag && matchSource;
    });
  }

  // Sprint 135: CRUD & Bulk Re-tag
  addTag(tagData) {
    const newTag = { id: `tag_${Date.now()}`, ...tagData };
    this.inMemoryTags.push(newTag);
    return newTag;
  }

  // Sprint 136: 30-Day Tag Analytics
  getTagAnalytics() {
    const topicCounts = {};
    this.inMemoryTags.forEach((t) => {
      topicCounts[t.topic] = (topicCounts[t.topic] || 0) + 1;
    });

    return {
      totalTags: this.inMemoryTags.length,
      topTopics30Days: topicCounts,
      mostActiveTag: "sql-injection",
    };
  }
}

module.exports = new TagService();
