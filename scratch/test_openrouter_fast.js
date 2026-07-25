require("dotenv").config({ path: "./backend/.env" });
const axios = require("axios");

async function testOpenRouterFastModels() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log("Testing live active OpenRouter small & fast free models...\n");

  const candidateModels = [
    "openrouter/free",
    "nvidia/nemotron-nano-9b-v2:free",
    "poolside/laguna-xs-2.1:free",
    "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
  ];

  for (const model of candidateModels) {
    try {
      const start = Date.now();
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [{ role: "user", content: "Reply in 5 words: Confirm fast response." }],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      const duration = Date.now() - start;
      const content = res.data?.choices?.[0]?.message?.content;
      console.log(`⚡ Model [${model}] responded in ${duration}ms:\n   "${content?.trim()}"\n`);
    } catch (err) {
      console.warn(`❌ Model [${model}] failed:`, err.response?.data?.error?.message || err.message);
    }
  }
}

testOpenRouterFastModels();
