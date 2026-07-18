const mongoose = require("mongoose");

const mcpConfigSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["stdio", "sse"],
      required: true,
    },
    // Stdio transport settings
    command: {
      type: String,
      required: function () {
        return this.type === "stdio";
      },
      trim: true
    },
    args: {
      type: [String],
      default: []
    },
    env: {
      type: Map,
      of: String,
      default: {}
    },
    // SSE transport settings
    sseUrl: {
      type: String,
      required: function () {
        return this.type === "sse";
      },
      trim: true
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("McpConfig", mcpConfigSchema);
