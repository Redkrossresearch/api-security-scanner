/**
 * memory.model.js (Sprint 63 — Long-Term Memory Store Model)
 * Persists user preferences, scan insights, conversation facts, and vector embeddings.
 */
const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["preference", "scan", "conversation", "fact"],
      default: "fact",
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    embedding: [Number],
  },
  {
    timestamps: true,
  }
);

memorySchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model("Memory", memorySchema);
