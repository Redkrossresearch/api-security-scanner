require("dotenv").config({ path: "./backend/.env" });
const axios = require("axios");

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Listing available models for GEMINI_API_KEY...");
  try {
    const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const models = res.data.models.map((m) => m.name);
    console.log("Available Gemini Models:\n", models);
  } catch (err) {
    console.error("List models error:", err.response?.data || err.message);
  }
}

listModels();
