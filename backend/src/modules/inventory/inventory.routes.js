const express = require("express");
const authenticate = require("../../middleware/auth.middleware");
const {
  triggerTargetScanHandler,
  getInventoryStatsHandler,
  getInventoryEndpointsHandler,
  getEndpointDetailsHandler,
  updateEndpointMetadataHandler,
  importSpecHandler,
  exportSpecHandler,
} = require("./inventory.controller");

const router = express.Router();

// Public / Authenticated Endpoints
router.get("/stats", authenticate, getInventoryStatsHandler);
router.get("/export", authenticate, exportSpecHandler);
router.get("/", authenticate, getInventoryEndpointsHandler);
router.get("/:id", authenticate, getEndpointDetailsHandler);
router.patch("/:id", authenticate, updateEndpointMetadataHandler);
router.post("/import", authenticate, importSpecHandler);
router.post("/scan-target", authenticate, triggerTargetScanHandler);

module.exports = router;
