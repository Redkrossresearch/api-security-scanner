/**
 * prompt-template.model.js (Sprint 84 — Prompt Library Model)
 * Stores saved user prompt templates and categories.
 */
const mongoose = require("mongoose");

const promptTemplateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "Security Audit",
    },
    templateText: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PromptTemplate", promptTemplateSchema);
