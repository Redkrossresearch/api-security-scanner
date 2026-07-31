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

    // --- 15 Practical Platform & User Settings ---
    username: {
      type: String,
      default: "Atharv_SecOps",
    },
    avatarUrl: {
      type: String,
      default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80",
    },
    email: {
      type: String,
      default: "atharv@redkross.org.in",
    },
    orgHandle: {
      type: String,
      default: "@redkross_research",
    },
    themeMode: {
      type: String,
      enum: ["dark_midnight", "cyberpunk", "obsidian", "light_sleek"],
      default: "dark_midnight",
    },
    accentColor: {
      type: String,
      default: "#F97316",
    },
    compactMode: {
      type: Boolean,
      default: false,
    },
    soundEnabled: {
      type: Boolean,
      default: true,
    },
    crawlDepth: {
      type: Number,
      default: 5,
    },
    rateLimit: {
      type: Number,
      default: 25,
    },
    subdomainDiscovery: {
      type: Boolean,
      default: true,
    },
    piiMasking: {
      type: Boolean,
      default: true,
    },
    twoFactorAuth: {
      type: Boolean,
      default: false,
    },
    webhookUrl: {
      type: String,
      default: "https://hooks.slack.com/services/T00000/B00000/XXXXXX",
    },
    logRetentionDays: {
      type: Number,
      default: 90,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Setting", settingSchema);
