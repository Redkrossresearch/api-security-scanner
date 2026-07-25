require("dotenv").config({ path: "./backend/.env" });
const GeminiAdapter = require("../backend/src/modules/llm/adapters/gemini.adapter");

async function testGeminiStream() {
  console.log("Testing GeminiAdapter.stream()...");
  const adapter = new GeminiAdapter();
  let fullText = "";
  try {
    const res = await adapter.stream(
      [{ role: "user", content: "Hi! Confirm live streaming is working." }],
      (token) => {
        fullText += token;
        process.stdout.write(token);
      }
    );
    console.log("\n\n🎉 GEMINI STREAMING SUCCESS! Total length:", fullText.length, "| Model:", res.model);
  } catch (err) {
    console.error("Gemini stream error:", err.message);
  }
}

testGeminiStream();
