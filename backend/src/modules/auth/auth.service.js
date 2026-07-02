const bcrypt = require("bcryptjs");
const User = require("./auth.model");
const jwt = require("jsonwebtoken");
const env = require("../../config/env");

const {generateAccessToken,generateRefreshToken,} = require("./token.service");

const registerUser = async ({
  name,
  email,
  password,
}) => {
  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(
    password,
    12
  );

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const loginUser = async ({
  email,
  password,
}) => {
  const user = await User.findOne({
    email,
    isDeleted: false,
  });
  
  

  if (!user) {
    throw new Error(
      "Invalid email or password"
    );
  }

  const isMatch = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isMatch) {
    throw new Error(
      "Invalid email or password"
    );
  }

  const accessToken =
    generateAccessToken(user);

  const refreshToken =
    generateRefreshToken(user);

const refreshTokenHash =
  await bcrypt.hash(refreshToken, 12);

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

const refreshAccessToken = async (
  refreshToken
) => {
  let decoded;

  try {
    decoded = jwt.verify(
      refreshToken,
      env.jwtRefreshSecret
    );
  } catch {
    throw new Error(
      "Invalid refresh token"
    );
  }

  const user = await User.findById(
    decoded.id
  );

  if (!user) {
    throw new Error("User not found");
  }

  const storedToken =
    user.refreshTokens.find((rt) =>
      bcrypt.compareSync(
        refreshToken,
        rt.token
      )
    );

  if (!storedToken) {
    throw new Error(
      "Refresh token not recognized"
    );
  }

  const accessToken =
    generateAccessToken(user);

  return { accessToken };
};

const logoutUser = async (
  userId,
  refreshToken
) => {
  const user =
    await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.refreshTokens =
    user.refreshTokens.filter(
      (rt) =>
        !bcrypt.compareSync(
          refreshToken,
          rt.token
        )
    );

  await user.save();
};

const logoutAllUser = async (
  userId
) => {
  const user =
    await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.refreshTokens = [];

  await user.save();
};



const googleLoginUser = async ({ name, email }) => {
  let user = await User.findOne({
    email,
    isDeleted: false,
  });

  if (!user) {
    const dummyPasswordHash = await bcrypt.hash("google-auth-no-password-" + Math.random(), 12);
    user = await User.create({
      name,
      email,
      passwordHash: dummyPasswordHash,
    });
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

module.exports = {
  registerUser,
  loginUser,
  googleLoginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllUser,
};