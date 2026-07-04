const express = require("express");

const router = express.Router();

const {
  getDashboardStats,
  getScanDetails,
  getDashboardActivityLogs,
} = require("./dashboard.controller");

router.get("/stats", getDashboardStats);
router.get("/activity-logs", getDashboardActivityLogs);

// NEW
router.get("/scans/:id", getScanDetails);

module.exports = router;