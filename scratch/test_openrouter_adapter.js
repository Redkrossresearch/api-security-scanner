require("dotenv").config({ path: "./backend/.env" });
const OpenRouterAdapter = require("../backend/src/modules/llm/adapters/openrouter.adapter");

async function testOpenRouterAdapter() {
  console.log("Testing OpenRouterAdapter with fast free models...");
  const adapter = new OpenRouterAdapter();
  let fullText = "";
  try {
    const res = await adapter.stream(
      [{ role: "user", content: "Say hello in 3 words." }],
      (token) => {
        fullText += token;
        process.stdout.write(token);
      }
    );
    console.log("\n\n🎉 OPENROUTER FAST STREAMING SUCCESS! Model:", res.model, "| Total length:", fullText.length);
  } catch (err) {
    console.error("OpenRouter stream error:", err.message);
  }
}

testOpenRouterAdapter();
