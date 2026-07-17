const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth.middleware");
const { authorizeTeam } = require("../../middleware/team.middleware");
const {
  createTeam,
  getTeams,
  addMember,
  removeMember,
  getAuditLogs,
} = require("./team.controller");

// General Routes
router.post("/", authenticate, createTeam);
router.get("/", authenticate, getTeams);

// Team-Specific Access Controlled Routes (X-Team-ID header required)
router.post(
  "/:id/members",
  authenticate,
  authorizeTeam(["owner", "admin"]),
  addMember,
);
router.delete(
  "/:id/members/:userId",
  authenticate,
  authorizeTeam(["owner", "admin"]),
  removeMember,
);
router.get(
  "/:id/audit",
  authenticate,
  authorizeTeam(["owner", "admin", "member"]),
  getAuditLogs,
);

module.exports = router;
