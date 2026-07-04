const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // API Authorization Configs
    targetHeaders: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
      }
    ],
    authType: {
      type: String,
      enum: ["none", "bearer", "apikey", "custom"],
      default: "none",
    },
    authToken: {
      type: String,
      default: "",
    },
    // Scheduling Configuration
    cronSchedule: {
      type: String,
      enum: ["disabled", "daily", "weekly", "monthly"],
      default: "disabled",
    },
    // Webhook Integrations
    slackWebhook: {
      type: String,
      default: "",
    },
    jiraWebhook: {
      type: String,
      default: "",
    },
    discordWebhook: {
      type: String,
      default: "",
    },
    // Tracking cron runs
    lastCronRun: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Setting", settingSchema);
