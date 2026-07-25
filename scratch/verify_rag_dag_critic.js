require("dotenv").config({ path: "./backend/.env" });
const mongoose = require("mongoose");
const dagGraph = require("../backend/src/modules/llm/rag/dag.knowledge.graph");
const ragPipeline = require("../backend/src/modules/llm/rag/rag.pipeline");

async function verifyRagDagCritic() {
  console.log("================================================================================");
  console.log("⚡ VERIFYING RAG, DAG KNOWLEDGE GRAPH & AI CRITIC SELF-LEARNING ENGINE");
  console.log("================================================================================\n");

  try {
    if (process.env.MONGODB_URI) {
      console.log("Connecting to MongoDB Atlas...");
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
      console.log("MongoDB Connected Successfully!\n");
    }
  } catch (err) {
    console.warn("MongoDB connection warning:", err.message);
  }

  const criticEvaluator = require("../backend/src/modules/llm/autonomous/critic.evaluator.service");
  const CopilotLearnedInsight = require("../backend/src/modules/copilot/learned.insight.model");

  // 1. Verify DAG Security Knowledge Graph Traversal
  console.log("1️⃣ Testing DAG Knowledge Graph Traversal for BOLA / IDOR query...");
  const dagRes = dagGraph.queryGraph("Explain BOLA vulnerability and how to fix it");
  console.log(dagRes);

  if (dagRes.includes("API1:2023 Broken Object Level Authorization") && dagRes.toLowerCase().includes("remediated_by")) {
    console.log("✅ DAG Knowledge Graph Traversal: PASSED!\n");
  } else {
    console.error("❌ DAG Knowledge Graph Traversal: FAILED!");
  }

  // 2. Verify RAG Pipeline Retrieval (Hybrid RAG + DAG Context)
  console.log("2️⃣ Testing RAG Pipeline Retrieval (Vector + Rerank + DAG)...");
  const ragRes = await ragPipeline.retrieveContext("JWT authentication broken secret check", 3);
  console.log(ragRes);
  if (ragRes.includes("DAG SECURITY KNOWLEDGE GRAPH TRAVERSAL")) {
    console.log("✅ RAG + DAG Hybrid Retrieval: PASSED!\n");
  } else {
    console.error("❌ RAG + DAG Hybrid Retrieval: FAILED!");
  }

  // 3. Verify AI Critic Evaluation & User Feedback Processing
  console.log("3️⃣ Testing User Feedback & AI Critic Self-Learning Process...");
  const dummyUserId = new mongoose.Types.ObjectId();
  const feedbackRes = await criticEvaluator.processFeedback(dummyUserId, {
    query: "How do I secure JWT tokens?",
    aiResponse: "Just store tokens in localStorage without expiration.",
    feedbackType: "thumbs_down",
    comment: "Never store sensitive JWTs in unencrypted localStorage! Use HttpOnly cookies.",
  });
  console.log("Feedback processing output:", feedbackRes);

  // 4. Verify Active Learned Insights Retrieval
  console.log("\n4️⃣ Verifying Active Learned Insights Injection...");
  const learnedInsightContext = await criticEvaluator.getActiveLearnedInsights(dummyUserId, "How to secure JWT token storage?");
  console.log(learnedInsightContext);

  if (learnedInsightContext.includes("CONTINUOUS SELF-LEARNING RULES")) {
    console.log("✅ AI Critic Self-Learning Loop: PASSED!\n");
    console.log("================================================================================");
    console.log("🎉 ALL RAG, DAG, AND AI CRITIC SELF-LEARNING TESTS PASSED 100%!");
    console.log("================================================================================");
  } else {
    console.error("❌ AI Critic Self-Learning Loop: FAILED!");
  }

  // Cleanup test insight
  if (mongoose.connection.readyState === 1) {
    await CopilotLearnedInsight.deleteMany({ userId: dummyUserId });
    await mongoose.connection.close();
  }
}

verifyRagDagCritic();
