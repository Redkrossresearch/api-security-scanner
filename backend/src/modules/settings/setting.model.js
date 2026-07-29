const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      index: true,
    },
    // API Authorization Configs
    targetHeaders: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
      },
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
    scheduledUrls: {
      type: String,
      default: "",
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
    // Custom System Prompt for AI Copilot
    customSystemPrompt: {
      type: String,
      default: "",
    },
    // GitHub Integration Configs
    githubToken: {
      type: String,
      default: "",
    },
    githubRepo: {
      type: String,
      default: "",
    },
    githubBranch: {
      type: String,
      default: "main",
    },
    // GitLab Integration Configs
    gitlabToken: {
      type: String,
      default: "",
    },
    gitlabRepo: {
      type: String,
      default: "",
    },
    gitlabBranch: {
      type: String,
      default: "main",
    },
    // Tracking cron runs
    lastCronRun: {
      type: Date,
      default: null,
    },
    emailNotificationEnabled: {
      type: Boolean,
      default: false,
    },
    emailRecipient: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Setting", settingSchema);
