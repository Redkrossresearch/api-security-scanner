const mongoose = require("mongoose");

const CopilotLearnedInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        "owasp_api",
        "cwe",
        "remediation_preference",
        "code_formatting",
        "security_policy",
        "user_correction",
        "critic_rule",
      ],
      default: "critic_rule",
    },
    rule: {
      type: String,
      required: true,
      trim: true,
    },
    triggerKeywords: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    confidenceScore: {
      type: Number,
      default: 0.8,
      min: 0,
      max: 1,
    },
    userFeedbackCount: {
      type: Number,
      default: 1,
    },
    positiveCount: {
      type: Number,
      default: 1,
    },
    negativeCount: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      enum: ["user_feedback", "critic_evaluation", "rag_analysis"],
      default: "user_feedback",
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

CopilotLearnedInsightSchema.index({ userId: 1, triggerKeywords: 1 });

module.exports = mongoose.model(
  "CopilotLearnedInsight",
  CopilotLearnedInsightSchema
);
