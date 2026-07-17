const mongoose = require("mongoose");

const copilotConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "New Conversation",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const copilotMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CopilotConversation",
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// Cascade delete messages when conversation is removed
copilotConversationSchema.pre("remove", async function (next) {
  await mongoose
    .model("CopilotMessage")
    .deleteMany({ conversationId: this._id });
  next();
});

const copilotMemorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    type: {
      type: String,
      enum: ["preference", "fact", "scan", "conversation"],
      default: "fact",
    },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const copilotTrainingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      index: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    response: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const CopilotConversation = mongoose.model(
  "CopilotConversation",
  copilotConversationSchema,
);
const CopilotMessage = mongoose.model("CopilotMessage", copilotMessageSchema);
const CopilotMemory = mongoose.model("CopilotMemory", copilotMemorySchema);
const CopilotTrainingPair = mongoose.model(
  "CopilotTrainingPair",
  copilotTrainingSchema,
);

module.exports = {
  CopilotConversation,
  CopilotMessage,
  CopilotMemory,
  CopilotTrainingPair,
};
