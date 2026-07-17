const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "analyst", "user"],
      default: "user",
      index: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    refreshTokens: [refreshTokenSchema],

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({
  email: 1,
  isDeleted: 1,
});

userSchema.index({
  role: 1,
  isDeleted: 1,
});

module.exports = mongoose.model("User", userSchema);
