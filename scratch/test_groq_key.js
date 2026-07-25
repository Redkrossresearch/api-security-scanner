require("dotenv").config({ path: "./backend/.env" });
const axios = require("axios");

async function testGroqKey() {
  const apiKey = process.env.GROQ_API_KEY;
  console.log("Testing Groq API Key connection...");

  const candidateModels = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
  ];

  for (const model of candidateModels) {
    try {
      const start = Date.now();
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model,
          messages: [{ role: "user", content: "Reply in 4 words: Groq LPU engine online." }],
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
      console.log(`\n🎉 GROQ MODEL [${model}] SUCCESS (${duration}ms):\n   "${content?.trim()}"`);
    } catch (err) {
      console.warn(`❌ Groq model [${model}] failed:`, err.response?.data?.error?.message || err.message);
    }
  }
}

testGroqKey();
