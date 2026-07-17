const axios = require("axios");
const env = require("../config/env");

const analyzeVulnerabilityWithAI = async (vulnerability) => {
  try {
    console.log("Using model:", env.openRouterModel);

    return {
      success: true,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  analyzeVulnerabilityWithAI,
};
