const express = require("express");

const router = express.Router();

const {
  getDashboardStats,
  getScanDetails,
} = require("./dashboard.controller");

router.get("/stats", getDashboardStats);

// NEW
router.get("/scans/:id", getScanDetails);

module.exports = router;