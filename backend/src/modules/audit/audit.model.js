const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    actor: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    device: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "Unknown",
    },
    session: {
      type: String,
      required: true,
      index: true,
    },
    correlationId: {
      type: String,
      required: true,
      index: true,
    },
    affectedResource: {
      type: String,
      required: true,
    },
    changes: {
      before: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
      after: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },
    risk: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
      index: true,
    },
    evidence: {
      type: String,
      default: "",
    },
    hash: {
      type: String,
      required: true,
    },
    signature: {
      type: String,
      required: true,
    },
    trustScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching and correlation tracing
AuditLogSchema.index({ action: 1, risk: 1 });
AuditLogSchema.index({ correlationId: 1, timestamp: 1 });

module.exports = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
