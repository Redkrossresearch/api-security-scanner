const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth.middleware");
const {
  list,
  timeline,
  vulnerabilityHistory,
  summary,
} = require("./history.controller");

router.get("/", authenticate, list);
router.get("/timeline", authenticate, timeline);
router.get("/vulnerabilities", authenticate, vulnerabilityHistory);
router.get("/summary", authenticate, summary);

module.exports = router;
