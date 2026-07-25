const express = require("express");
const router = express.Router();
const AuditLog = require("./audit.model");
const auditService = require("./audit.service");

// GET /api/audit-logs - Retrieve logs with filters, search, and sorting
router.get("/", async (req, res, next) => {
  try {
    const { search, risk, action, correlationId } = req.query;
    const query = {};

    if (risk) {
      query.risk = risk;
    }
    if (action) {
      query.action = action;
    }
    if (correlationId) {
      query.correlationId = correlationId;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { eventId: searchRegex },
        { action: searchRegex },
        { actor: searchRegex },
        { affectedResource: searchRegex },
        { evidence: searchRegex },
        { ipAddress: searchRegex },
        { location: searchRegex }
      ];
    }

    // Default sort: newest logs first
    const logs = await AuditLog.find(query).sort({ timestamp: -1 });
    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
});

// GET /api/audit-logs/verify - Run cryptographic verification on all logs
router.get("/verify", async (req, res, next) => {
  try {
    const stats = await auditService.runFullIntegrityScan();
    res.json({ success: true, ...stats });
  } catch (error) {
    next(error);
  }
});

// GET /api/audit-logs/correlation/:id - Retrieve full trace chain for correlationId
router.get("/correlation/:id", async (req, res, next) => {
  try {
    const correlationId = req.params.id;
    const chain = await AuditLog.find({ correlationId }).sort({ timestamp: 1 });
    res.json({ success: true, count: chain.length, chain });
  } catch (error) {
    next(error);
  }
});

// POST /api/audit-logs/tamper - Simulate malicious database edit
router.post("/tamper", async (req, res, next) => {
  try {
    const result = await auditService.tamperLogData();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/audit-logs/restore - Fix all logs and recalculate hashes
router.post("/restore", async (req, res, next) => {
  try {
    const result = await auditService.restoreLogData();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
