/**
 * custom-agent.model.js (Sprint 90 — Custom Agents Schema)
 * Stores user-defined custom specialized agent definitions.
 */
const mongoose = require("mongoose");

const customAgentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
    },
    systemPrompt: {
      type: String,
      required: true,
    },
    toolsAllowed: [{ type: String }],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CustomAgent", customAgentSchema);
