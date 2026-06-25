const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: process.env.PORT || 5000,

  mongoUri: process.env.MONGODB_URI,

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,

  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,

  clientUrl: process.env.CLIENT_URL,

  openRouterApiKey: process.env.OPENROUTER_API_KEY,

  openRouterModel: process.env.OPENROUTER_MODEL,
};