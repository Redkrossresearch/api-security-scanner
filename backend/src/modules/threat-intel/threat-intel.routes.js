const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth.middleware");

const {
  runFullScan,
  getCVE,
  getShodanHost,
  getVirusTotalScan,
  getVulnersSoftware,
} = require("./threat-intel.controller");

// All routes require authentication
router.use(authenticate);

// Full threat intel scan (all sources + catalog + NVD enrichment)
router.post("/scan", runFullScan);

// NVD CVE lookup
router.get("/cve/:cveId", getCVE);

// Shodan host/domain scan
router.get("/shodan/:host", getShodanHost);

// VirusTotal domain/IP/URL scan
router.get("/virustotal/:target", getVirusTotalScan);

// Vulners software CVE search
router.get("/vulners/:software", getVulnersSoftware);

module.exports = router;
