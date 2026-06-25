const express = require("express");

const router = express.Router();

const authenticate = require("../../middleware/auth.middleware");

const {
  create,
  getAll,
  getScanHistory,
  getScanById,
  deleteScan,
  getDashboardSummary,
  getRiskDistribution,
  getScanActivity,
  getVulnerabilityTrends,
  getAssetLeaderboard,
  getHeatmap,
  getAIInsights,
} = require("./scan.controller");

// ==================== CORE ROUTES ====================

router.post("/", authenticate, create);

router.get("/", authenticate, getAll);

router.get("/history", authenticate, getScanHistory);

// ==================== DASHBOARD ROUTES (NO AUTH - DEV MODE) ====================

router.get("/dashboard/summary", getDashboardSummary);

router.get("/dashboard/risk-distribution", getRiskDistribution);

router.get("/dashboard/activity", getScanActivity);

router.get("/dashboard/vulnerability-trends", getVulnerabilityTrends);

router.get("/dashboard/leaderboard", authenticate, getAssetLeaderboard);

router.get("/dashboard/heatmap", getHeatmap);

router.get("/dashboard/ai-insights", getAIInsights);

// ==================== DYNAMIC ROUTES (LAST) ====================

router.get("/:id", authenticate, getScanById);

router.delete("/:id", authenticate, deleteScan);

module.exports = router;
