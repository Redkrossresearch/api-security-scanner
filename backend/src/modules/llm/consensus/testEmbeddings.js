require("dotenv").config({ path: "../../../../.env" });
const OpenAIAdapter = require("../adapters/openai.adapter");
const GeminiAdapter = require("../adapters/gemini.adapter");

async function runTest() {
  console.log("=== Testing Embeddings Support (Sprint 10) ===");
  const openai = new OpenAIAdapter();
  const gemini = new GeminiAdapter();

  try {
    const text = "API Security is paramount.";
    console.log(`Generating embedding for text: "${text}"`);

    // 1. OpenAI Embedding
    if (process.env.OPENAI_API_KEY) {
      console.log("\nCalling OpenAI text-embedding-3-small...");
      const resOpenAI = await openai.embed(text);
      console.log("OpenAI success! Dimension:", resOpenAI.embedding?.length);
    } else {
      console.log("\n[Skip] OpenAI API key not found in environment.");
    }

    // 2. Gemini Embedding
    if (process.env.GEMINI_API_KEY) {
      console.log("\nCalling Gemini text-embedding-004...");
      const resGemini = await gemini.embed(text);
      console.log("Gemini success! Dimension:", resGemini.embedding?.length);
    } else {
      console.log("\n[Skip] Gemini API key not found in environment.");
    }

  } catch (err) {
    console.error("Embedding check failed:", err.message);
  }
}

runTest().catch(console.error);
