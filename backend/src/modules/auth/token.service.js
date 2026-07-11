const jwt = require("jsonwebtoken");
const env = require("../../config/env");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    env.jwtAccessSecret,
    {
      expiresIn: "365d",
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    env.jwtRefreshSecret,
    {
      expiresIn: "365d",
    }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};