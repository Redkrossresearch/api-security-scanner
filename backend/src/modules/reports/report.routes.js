const express = require("express");

const router = express.Router();
const authenticate = require("../../middleware/auth.middleware");

const {
  getReport,
  exportJsonReport,
  exportCsvReport,
  exportPdfReport,
  exportOpenApiReport,
} = require("./report.controller");

router.get("/:scanId", authenticate, getReport);

router.get("/:scanId/export/json", authenticate, exportJsonReport);

router.get("/:scanId/export/csv", authenticate, exportCsvReport);

router.get("/:scanId/export/pdf", authenticate, exportPdfReport);

router.get("/:scanId/export/openapi", authenticate, exportOpenApiReport);

module.exports = router;
