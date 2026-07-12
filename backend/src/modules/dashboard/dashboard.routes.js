const express = require("express");

const router = express.Router();
const authenticate = require("../../middleware/auth.middleware");

const {
  getDashboardStats,
  getScanDetails,
  getDashboardActivityLogs,
} = require("./dashboard.controller");

router.get("/stats", authenticate, getDashboardStats);
router.get("/activity-logs", authenticate, getDashboardActivityLogs);

// NEW
router.get("/scans/:id", authenticate, getScanDetails);

module.exports = router;