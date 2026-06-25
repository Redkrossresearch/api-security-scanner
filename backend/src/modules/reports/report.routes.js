const express = require("express");

const router = express.Router();

const {
  getReport,
  exportJsonReport,
  exportCsvReport,
  exportPdfReport,
} = require("./report.controller");

router.get("/:scanId", getReport);

router.get("/:scanId/export/json", exportJsonReport);

router.get("/:scanId/export/csv", exportCsvReport);

router.get("/:scanId/export/pdf", exportPdfReport);

module.exports = router;
