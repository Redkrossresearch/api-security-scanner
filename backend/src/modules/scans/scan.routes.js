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
  getScanStatus,
  reAuditScan,
} = require("./scan.controller");

// ==================== CORE ROUTES ====================

router.post("/", authenticate, create);

router.get("/", authenticate, getAll);

router.get("/history", authenticate, getScanHistory);

// ==================== DASHBOARD ROUTES ====================

router.get("/dashboard/summary", authenticate, getDashboardSummary);

router.get("/dashboard/risk-distribution", authenticate, getRiskDistribution);

router.get("/dashboard/activity", authenticate, getScanActivity);

router.get(
  "/dashboard/vulnerability-trends",
  authenticate,
  getVulnerabilityTrends,
);

router.get("/dashboard/leaderboard", authenticate, getAssetLeaderboard);

router.get("/dashboard/heatmap", authenticate, getHeatmap);

router.get("/dashboard/ai-insights", authenticate, getAIInsights);

// ==================== DYNAMIC ROUTES (LAST) ====================

router.post("/:id/reaudit", authenticate, reAuditScan);

router.get("/:id/status", authenticate, getScanStatus);

router.get("/:id", authenticate, getScanById);

router.delete("/:id", authenticate, deleteScan);

module.exports = router;
