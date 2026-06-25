const express = require("express");

const router = express.Router();

const { analyze, exportPdf } = require("./ai.controller");

router.post("/analyze", analyze);

router.post("/export-pdf", exportPdf);

module.exports = router;
