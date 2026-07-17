const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    details: {
      type: Map,
      of: String,
      default: {},
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Index to fetch recent logs for a team
auditLogSchema.index({ teamId: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
