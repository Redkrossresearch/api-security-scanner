/**
 * tag.schema.js (Sprint 131 — Knowledge Tagging Vocabulary & Schema)
 * Defines standardized tag metadata structure: { entity, topic, sourceType, confidence, freshness, severity }
 */
const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    topic: {
      type: String,
      enum: ["owasp", "sqli", "jwt", "cve", "auth", "general"],
      default: "general",
    },
    sourceType: {
      type: String,
      enum: ["rag", "web-search", "user-input", "auto-generated"],
      default: "auto-generated",
    },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low", "info"],
      default: "info",
    },
    entityId: String,
    confidence: {
      type: Number,
      default: 0.9,
    },
  },
  {
    timestamps: true,
  }
);

tagSchema.index({ name: 1, topic: 1 });

module.exports = mongoose.model("Tag", tagSchema);
