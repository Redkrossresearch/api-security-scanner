const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth.middleware");
const { 
  getSettings, 
  updateSettings, 
  syncGithubWorkflow,
  getGithubClientId,
  handleGithubCallback,
  getGithubRepos,
  disconnectGithub,
  getGithubBranches,
  renderMockAuthorize,
} = require("./setting.controller");

router.get("/", authenticate, getSettings);
router.put("/", authenticate, updateSettings);
router.post("/github/sync", authenticate, syncGithubWorkflow);
router.get("/github/client-id", authenticate, getGithubClientId);
router.post("/github/callback", authenticate, handleGithubCallback);
router.get("/github/repos", authenticate, getGithubRepos);
router.delete("/github/disconnect", authenticate, disconnectGithub);
router.get("/github/branches", authenticate, getGithubBranches);
router.get("/github/mock-authorize", renderMockAuthorize);

module.exports = router;
