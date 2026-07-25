require("dotenv").config({ path: "./backend/.env" });
const axios = require("axios");

async function listOpenRouterFreeModels() {
  console.log("Fetching live free models from OpenRouter API...");
  try {
    const res = await axios.get("https://openrouter.ai/api/v1/models");
    const freeModels = res.data.data
      .filter((m) => m.id.endsWith(":free") || m.id.includes("free"))
      .map((m) => ({ id: m.id, name: m.name, context_length: m.context_length }));

    console.log(`\nFound ${freeModels.length} active free models on OpenRouter:\n`);
    freeModels.forEach((m) => console.log(`- ID: ${m.id} | Name: ${m.name}`));
  } catch (err) {
    console.error("Failed to list models:", err.message);
  }
}

listOpenRouterFreeModels();
