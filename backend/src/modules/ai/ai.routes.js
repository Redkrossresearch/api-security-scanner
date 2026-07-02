const express = require("express");

const router = express.Router();

const { analyze, exportPdf } = require("./ai.controller");
const authenticate = require("../../middleware/auth.middleware");

router.post("/analyze", authenticate, analyze);

router.post("/export-pdf", authenticate, exportPdf);

module.exports = router;
