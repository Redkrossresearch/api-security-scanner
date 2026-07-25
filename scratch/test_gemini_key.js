require("dotenv").config({ path: "./backend/.env" });
const GeminiAdapter = require("../backend/src/modules/llm/adapters/gemini.adapter");

async function testGeminiAdapter() {
  console.log("Testing GeminiAdapter class with gemini-flash-latest...");
  const adapter = new GeminiAdapter();
  try {
    const res = await adapter.generate([{ role: "user", content: "Explain OWASP BOLA in 2 short bullet points." }]);
    console.log("\n🎉 GEMINI ADAPTER SUCCESS! Model:", res.model);
    console.log("Response Content:\n", res.content);
  } catch (err) {
    console.error("GeminiAdapter Error:", err.message);
  }
}

testGeminiAdapter();
