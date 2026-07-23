/**
 * workflow.model.js (Sprint 68 — Workflow Builder Schema)
 * Stores user-defined custom automation workflows with step sequences.
 */
const mongoose = require("mongoose");

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    steps: [
      {
        stepIndex: Number,
        actionType: { type: String, required: true }, // e.g. "crawl", "scan", "rag", "report"
        targetUrl: String,
        params: { type: mongoose.Schema.Types.Mixed, default: {} },
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Workflow", workflowSchema);
