const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth.middleware");
const { getSettings, updateSettings } = require("./setting.controller");

router.get("/", authenticate, getSettings);
router.put("/", authenticate, updateSettings);

module.exports = router;
