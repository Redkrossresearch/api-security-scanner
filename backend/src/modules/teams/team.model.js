const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: false,
        },
        email: {
          type: String,
          required: true,
          trim: true,
        },
        role: {
          type: String,
          enum: ["owner", "admin", "member"],
          default: "member",
        },
        status: {
          type: String,
          enum: ["active", "pending"],
          default: "active",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Index to quickly fetch teams a user belongs to
teamSchema.index({ "members.userId": 1 });

module.exports = mongoose.model("Team", teamSchema);
