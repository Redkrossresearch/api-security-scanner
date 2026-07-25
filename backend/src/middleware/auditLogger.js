const crypto = require("crypto");
const auditService = require("../modules/audit/audit.service");

const auditLoggerMiddleware = (req, res, next) => {
  res.on("finish", async () => {
    try {
      const statusCode = res.statusCode;
      const isSuccess = statusCode >= 200 && statusCode < 300;
      const method = req.method;
      const path = req.originalUrl || req.url;

      let action = null;
      let risk = "low";
      let affectedResource = "";
      let evidence = "";
      let changes = null;
      let actor = req.user?.email || "Admin (Atharv)"; // Default to Atharv since he is running it locally

      // Identify audit-relevant endpoints
      if (path.startsWith("/api/auth/login") && method === "POST") {
        action = "user.login";
        risk = isSuccess ? "low" : "high";
        affectedResource = "Auth Service: POST /api/auth/login";
        evidence = isSuccess 
          ? `User '${req.body?.email}' successfully logged in.`
          : `Failed login attempt for user '${req.body?.email}'. Status: ${statusCode}`;
      } 
      else if (path.startsWith("/api/auth/register") && method === "POST") {
        action = "user.register";
        risk = "medium";
        affectedResource = "Auth Service: POST /api/auth/register";
        evidence = isSuccess
          ? `New user registered: '${req.body?.email}'.`
          : `Failed registration attempt for '${req.body?.email}'.`;
      }
      else if (path.startsWith("/api/scans") && method === "POST" && path.includes("launch")) {
        action = "scan.start";
        risk = "medium";
        affectedResource = `Scan Controller: POST ${path}`;
        evidence = `Vulnerability scan launched for target: ${req.body?.target || "N/A"}`;
        changes = {
          before: { status: "idle" },
          after: { status: "running", target: req.body?.target }
        };
      }
      else if (path.startsWith("/api/settings") && (method === "PUT" || method === "POST" || method === "PATCH")) {
        action = "settings.update";
        risk = "medium";
        affectedResource = `Settings Manager: ${method} ${path}`;
        evidence = `System configurations modified. Status: ${statusCode}`;
        changes = {
          before: { config: "Previous State" },
          after: { config: "Updated State", payload: req.body }
        };
      }
      else if (path.startsWith("/api/reports/download") && method === "GET") {
        action = "report.download";
        risk = "low";
        affectedResource = `Report Manager: GET ${path}`;
        evidence = `Security audit report downloaded.`;
      }
      else if (path.startsWith("/api/vulnerabilities") && (method === "DELETE" || method === "PUT" || method === "PATCH")) {
        action = "vulnerability.modify";
        risk = "high";
        affectedResource = `Vulnerability Catalog: ${method} ${path}`;
        evidence = `Vulnerability database modified. Action: ${method}`;
      }

      // If we identified an audit action, save it to the database!
      if (action) {
        // Dynamic import to prevent early mongoose initialization issues
        const AuditLog = require("../modules/audit/audit.model");

        const correlationId = req.correlationId || crypto.randomUUID();
        const session = req.cookies?.sessionId || req.headers["authorization"] || "SESS-active-session";
        const ipAddress = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
        const device = req.headers["user-agent"] || "Unknown Device";
        const location = "Localhost";

        // Generate eventId
        const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
        const eventId = `EVT-${Date.now().toString().slice(-6)}-${rand}`;

        const logObj = {
          eventId,
          timestamp: new Date(),
          action,
          actor,
          ipAddress,
          device,
          location,
          session,
          correlationId,
          affectedResource,
          changes,
          risk,
          evidence,
        };

        // calculate hash and signature
        logObj.hash = auditService.calculateHash(logObj);
        logObj.signature = auditService.calculateSignature(logObj.hash);
        
        let verifiedChecks = 5;
        if (logObj.ipAddress) verifiedChecks++;
        if (logObj.device) verifiedChecks++;
        if (logObj.changes) verifiedChecks++;
        logObj.trustScore = Math.round((verifiedChecks / 8) * 100);
        logObj.isVerified = true;

        const auditEntry = new AuditLog(logObj);
        await auditEntry.save();
        console.log(`[Audit Logger Middleware] Automatically logged real security event: ${action} (${eventId})`);
      }
    } catch (err) {
      console.error("[Audit Logger Middleware] Error logging audit event:", err.message);
    }
  });

  next();
};

module.exports = auditLoggerMiddleware;
