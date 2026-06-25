const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    scanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scan",
      required: true,
    },

    securityScore: {
      type: Number,
      required: true,
    },

    grade: {
      type: String,
      required: true,
    },

    riskLevel: {
      type: String,
      required: true,
    },

    summary: {
      totalFindings: Number,

      critical: Number,

      high: Number,

      medium: Number,

      low: Number,

      info: Number,
    },

    owaspBreakdown: {
      type: Object,
      default: {},
    },

    cweBreakdown: {
      type: Object,
      default: {},
    },

    topFindings: [
      {
        title: String,
        severity: String,
      },
    ],

    recommendations: [String],

    executiveSummary: {
      type: String,
    },

    riskOverview: {
      type: String,
    },

    remediationRoadmap: {
      immediateActions: [String],
      highPriorityActions: [String],
      mediumPriorityActions: [String],
      longTermImprovements: [String],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Report", reportSchema);
