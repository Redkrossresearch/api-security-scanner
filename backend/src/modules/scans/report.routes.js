const express =
  require("express");

const router =
  express.Router();

const {
  getReport,
} = require(
  "./report.controller"
);

router.get(
  "/:scanId",
  getReport
);

module.exports =
  router;