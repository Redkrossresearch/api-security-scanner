const mongoose = require("mongoose");

const WorkflowStepSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  stepType: {
    type: String,
    enum: ["scan", "cve_search", "owasp_mapping", "risk_score", "report", "notify"],
    required: true,
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  dependsOn: {
    type: [String],
    default: [],
  },
});

const WorkflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    steps: [WorkflowStepSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workflow", WorkflowSchema);
