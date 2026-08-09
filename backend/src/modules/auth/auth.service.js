const bcrypt = require("bcryptjs");
const User = require("./auth.model");
const jwt = require("jsonwebtoken");
const env = require("../../config/env");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("./token.service");

const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  // Auto-link pending invitations
  await autoLinkTeamInvitations(user._id, user.email);

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({
    email,
    isDeleted: false,
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(user);

  const refreshToken = generateRefreshToken(user);

  const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

  user.refreshTokens.push({
    token: refreshTokenHash,
  });

  user.lastLogin = new Date();

  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const refreshAccessToken = async (refreshToken) => {
  let decoded;

  try {
    decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch {
    throw new Error("Invalid refresh token");
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new Error("User not found");
  }

  const storedToken = user.refreshTokens.find((rt) =>
    bcrypt.compareSync(refreshToken, rt.token),
  );

  if (!storedToken) {
    throw new Error("Refresh token not recognized");
  }

  const accessToken = generateAccessToken(user);

  return { accessToken };
};

const logoutUser = async (userId, refreshToken) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.refreshTokens = user.refreshTokens.filter(
    (rt) => !bcrypt.compareSync(refreshToken, rt.token),
  );

  await user.save();
};

const logoutAllUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.refreshTokens = [];

  await user.save();
};

const googleLoginUser = async ({ name, email, avatarUrl }) => {
  let user = await User.findOne({
    email,
    isDeleted: false,
  });

  if (!user) {
    const dummyPasswordHash = await bcrypt.hash(
      "google-auth-no-password-" + Math.random(),
      12,
    );
    user = await User.create({
      name,
      email,
      passwordHash: dummyPasswordHash,
      avatarUrl: avatarUrl || "",
    });
    // Auto-link pending invitations
    await autoLinkTeamInvitations(user._id, user.email);
  } else if (avatarUrl && (!user.avatarUrl || user.avatarUrl !== avatarUrl)) {
    user.avatarUrl = avatarUrl;
    await user.save();
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

  user.refreshTokens.push({
    token: refreshTokenHash,
  });

  user.lastLogin = new Date();
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl || avatarUrl || "",
    },
  };
};

const autoLinkTeamInvitations = async (userId, email) => {
  try {
    const Team = require("../teams/team.model");
    const emailLower = email.toLowerCase().trim();
    // Update all team documents where there is a member matching email and status pending
    await Team.updateMany(
      { "members.email": emailLower, "members.status": "pending" },
      { 
        $set: { 
          "members.$[elem].userId": userId, 
          "members.$[elem].status": "active" 
        } 
      },
      { arrayFilters: [{ "elem.email": emailLower, "elem.status": "pending" }] }
    );
    console.log(`[Auth Service] Auto-linked user ${emailLower} to pending team invitations.`);
  } catch (teamErr) {
    console.error("[Auth Service] Failed to auto-link team invitations:", teamErr.message);
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLoginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllUser,
};
