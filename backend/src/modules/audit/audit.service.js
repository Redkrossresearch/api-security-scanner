const crypto = require("crypto");
const AuditLog = require("./audit.model");

// Recalculates the SHA-256 integrity hash of a log
const calculateHash = (log) => {
  const changesStr = log.changes ? JSON.stringify(log.changes) : "";
  const payload = [
    log.eventId,
    new Date(log.timestamp).toISOString(),
    log.action,
    log.actor,
    log.ipAddress,
    log.device,
    log.session,
    log.correlationId,
    log.affectedResource,
    changesStr,
    log.risk
  ].join("|");

  return crypto.createHash("sha256").update(payload).digest("hex");
};

// Generates a mock but realistic elliptic-curve digital signature
const calculateSignature = (hash) => {
  // Use a fixed system public key representation
  const secretKey = "api-security-scanner-secure-key";
  return crypto.createHmac("sha256", secretKey).update(hash).digest("hex");
};

// Validates the cryptographic integrity of a log
const verifyIntegrity = (log) => {
  const recomputedHash = calculateHash(log);
  return recomputedHash === log.hash;
};

// Seeds the database with high-fidelity realistic audit logs if empty
const seedAuditLogs = async () => {
  try {
    const count = await AuditLog.countDocuments();
    if (count > 0) return;

    console.log("[Audit Service] Database is empty. Seeding forensic black box audit logs...");

    const mockLogs = [];
    const baseTime = new Date(Date.now() - 4 * 60 * 60 * 1000); // 4 hours ago

    // Scenario 1: Authentication & Penetration Scan session (Correlation ID: CORR-A1BC-922)
    const correlation1 = "CORR-A1BC-9D22-78EF";
    const session1 = "SESS-auth-923a1";
    const ip1 = "192.168.1.105";
    const device1 = "macOS / Chrome 127.0";
    const location1 = "Mumbai, India";

    const scenario1Steps = [
      {
        eventId: "EVT-1001-A1",
        offsetMs: 0,
        action: "user.login",
        actor: "Admin (Atharv)",
        affectedResource: "Auth Service: POST /api/auth/login",
        risk: "low",
        evidence: "User 'atharvgupta790@gmail.com' successfully logged in from recognized IP.",
        changes: null,
      },
      {
        eventId: "EVT-1002-A1",
        offsetMs: 90000, // +1.5 min
        action: "token.generate",
        actor: "Auth Service",
        affectedResource: "JWT Manager: generateAccessToken()",
        risk: "low",
        evidence: "Access token generated for user ID: 609a5be9d2a9129614a476b40dd220d997d4e87a. Expires in 15m.",
        changes: {
          before: { expiry: "N/A" },
          after: { expiry: "15m", algorithm: "RS256" }
        },
      },
      {
        eventId: "EVT-1003-A1",
        offsetMs: 180000, // +3 min
        action: "settings.update",
        actor: "Admin (Atharv)",
        affectedResource: "Settings Manager: PUT /api/settings/jwt",
        risk: "medium",
        evidence: "JWT expiration threshold elevated from default 15 minutes to 24 hours.",
        changes: {
          before: { expiration: "15m" },
          after: { expiration: "24h" }
        },
      },
      {
        eventId: "EVT-1004-A1",
        offsetMs: 300000, // +5 min
        action: "key.create",
        actor: "Admin (Atharv)",
        affectedResource: "API Key Manager: POST /api/settings/keys",
        risk: "high",
        evidence: "Created secondary API credential 'production-agent-shield' with write access.",
        changes: {
          before: null,
          after: { keyId: "key_prod_agent_71ab", role: "WriteAccess", enabled: true }
        },
      },
      {
        eventId: "EVT-1005-A1",
        offsetMs: 480000, // +8 min
        action: "scan.start",
        actor: "Security Engine",
        affectedResource: "Scan Controller: POST /api/scans/launch",
        risk: "medium",
        evidence: "Full vulnerability scan started for target: https://api.enterprise.internal",
        changes: {
          before: { status: "idle" },
          after: { status: "running", scanProfile: "Full Security Audit" }
        },
      },
      {
        eventId: "EVT-1006-A1",
        offsetMs: 600000, // +10 min
        action: "rate.limit.trigger",
        actor: "Rate Limiter",
        affectedResource: "API Shield: GET /api/v1/users",
        risk: "high",
        evidence: "Rate limit triggered for IP 192.168.1.105. 500 requests exceeded in 1 minute limit.",
        changes: {
          before: { rateLimit: "100req/m" },
          after: { rateLimit: "500req/m (Temporary Threshold Override)" }
        },
      },
      {
        eventId: "EVT-1007-A1",
        offsetMs: 900000, // +15 min
        action: "report.generate",
        actor: "Report Engine",
        affectedResource: "PDF Generator: createReport()",
        risk: "low",
        evidence: "Vulnerability analysis PDF successfully compiled with 52 modules telemetry.",
        changes: null,
      },
      {
        eventId: "EVT-1008-A1",
        offsetMs: 960000, // +16 min
        action: "report.download",
        actor: "Admin (Atharv)",
        affectedResource: "Report Manager: GET /api/reports/download/SCAN-7281",
        risk: "low",
        evidence: "User downloaded generated PDF. Report hash: pdf_dca83f12bb78ff...",
        changes: null,
      }
    ];

    scenario1Steps.forEach((step) => {
      const timestamp = new Date(baseTime.getTime() + step.offsetMs);
      const logObj = {
        eventId: step.eventId,
        timestamp,
        action: step.action,
        actor: step.actor,
        ipAddress: ip1,
        device: device1,
        location: location1,
        session: session1,
        correlationId: correlation1,
        affectedResource: step.affectedResource,
        changes: step.changes,
        risk: step.risk,
        evidence: step.evidence,
      };

      const hash = calculateHash(logObj);
      logObj.hash = hash;
      logObj.signature = calculateSignature(hash);

      // Verify log completeness to calculate trust score
      let verifiedChecks = 5;
      if (logObj.ipAddress) verifiedChecks++;
      if (logObj.device) verifiedChecks++;
      if (logObj.changes) verifiedChecks++;
      logObj.trustScore = Math.round((verifiedChecks / 8) * 100);
      logObj.isVerified = true;

      mockLogs.push(logObj);
    });

    // Scenario 2: Role Escalation and Security Hardening (Correlation ID: CORR-ROLE-F802)
    const correlation2 = "CORR-ROLE-F802-C32A";
    const session2 = "SESS-team-44fa12";
    const ip2 = "10.0.4.15";
    const device2 = "Windows 11 / Firefox 128.0";
    const location2 = "Bengaluru, India";

    const scenario2Steps = [
      {
        eventId: "EVT-2001-A2",
        offsetMs: 1200000, // +20 min
        action: "team.member.invite",
        actor: "Admin (Atharv)",
        affectedResource: "Team Service: POST /api/teams/invite",
        risk: "medium",
        evidence: "Invited user 'muskan@redkross.org' with default role: Developer.",
        changes: {
          before: null,
          after: { email: "muskan@redkross.org", role: "Developer", status: "pending" }
        },
      },
      {
        eventId: "EVT-2002-A2",
        offsetMs: 1500000, // +25 min
        action: "role.change",
        actor: "Admin (Atharv)",
        affectedResource: "Team Manager: PATCH /api/teams/members/role",
        risk: "high",
        evidence: "Escalated member 'muskan@redkross.org' from Developer to Admin.",
        changes: {
          before: { role: "Developer" },
          after: { role: "Admin" }
        },
      },
      {
        eventId: "EVT-2003-A2",
        offsetMs: 1600000, // +26 min
        action: "team.delete",
        actor: "Admin (Atharv)",
        affectedResource: "Team Service: DELETE /api/teams/default-staging",
        risk: "critical",
        evidence: "Deleted default staging workspace 'Redkross Staging Engine'.",
        changes: {
          before: { workspace: "Redkross Staging Engine", activeMembers: 4 },
          after: null
        },
      }
    ];

    scenario2Steps.forEach((step) => {
      const timestamp = new Date(baseTime.getTime() + step.offsetMs);
      const logObj = {
        eventId: step.eventId,
        timestamp,
        action: step.action,
        actor: step.actor,
        ipAddress: ip2,
        device: device2,
        location: location2,
        session: session2,
        correlationId: correlation2,
        affectedResource: step.affectedResource,
        changes: step.changes,
        risk: step.risk,
        evidence: step.evidence,
      };

      const hash = calculateHash(logObj);
      logObj.hash = hash;
      logObj.signature = calculateSignature(hash);

      let verifiedChecks = 6;
      if (logObj.ipAddress) verifiedChecks++;
      if (logObj.device) verifiedChecks++;
      logObj.trustScore = Math.round((verifiedChecks / 8) * 100);
      logObj.isVerified = true;

      mockLogs.push(logObj);
    });

    // Scenario 3: Unauthorized Brute-force & Attack Block (Correlation ID: CORR-ATTACK-08C)
    const correlation3 = "CORR-ATTACK-08CF-421";
    const session3 = "SESS-unknown-9311b";
    const ip3 = "185.220.101.4"; // Tor exit node
    const device3 = "Linux / Python-requests 2.31";
    const location3 = "Frankfurt, Germany";

    const scenario3Steps = [
      {
        eventId: "EVT-3001-A3",
        offsetMs: 2000000,
        action: "unauthorized.access.attempt",
        actor: "Unknown (Attacker)",
        affectedResource: "Auth Service: POST /api/auth/login",
        risk: "high",
        evidence: "Brute force attack detected: 45 failed login attempts for user 'admin@redkross.org' in 15 seconds.",
        changes: null,
      },
      {
        eventId: "EVT-3002-A3",
        offsetMs: 2010000,
        action: "ip.block",
        actor: "Intelligent Guard",
        affectedResource: "Firewall Gateway: blockIp()",
        risk: "critical",
        evidence: "Host IP 185.220.101.4 added to dynamic block list for 24 hours.",
        changes: {
          before: { status: "allowed" },
          after: { status: "blocked", reason: "Brute-force security policy trigger" }
        },
      }
    ];

    scenario3Steps.forEach((step) => {
      const timestamp = new Date(baseTime.getTime() + step.offsetMs);
      const logObj = {
        eventId: step.eventId,
        timestamp,
        action: step.action,
        actor: step.actor,
        ipAddress: ip3,
        device: step.action.includes("ip.block") ? "System Firewall" : device3,
        location: location3,
        session: session3,
        correlationId: correlation3,
        affectedResource: step.affectedResource,
        changes: step.changes,
        risk: step.risk,
        evidence: step.evidence,
      };

      const hash = calculateHash(logObj);
      logObj.hash = hash;
      logObj.signature = calculateSignature(hash);

      let verifiedChecks = 7;
      if (logObj.ipAddress) verifiedChecks++;
      logObj.trustScore = Math.round((verifiedChecks / 8) * 100);
      logObj.isVerified = true;

      mockLogs.push(logObj);
    });

    await AuditLog.insertMany(mockLogs);
    console.log("[Audit Service] Successfully seeded all forensic audit logs.");
  } catch (error) {
    console.error("[Audit Service] Seeding failed:", error.message);
  }
};

// Admin utility: Simulates database tampering by editing data directly without hashing
const tamperLogData = async () => {
  try {
    // Tamper the critical event 'role.change' (EVT-2002-A2)
    const targetEvent = await AuditLog.findOne({ eventId: "EVT-2002-A2" });
    if (targetEvent) {
      targetEvent.actor = "Malicious Intruder";
      targetEvent.changes = {
        before: { role: "Developer" },
        after: { role: "SuperAdmin" } // Escalate role further
      };
      targetEvent.isVerified = false;
      await targetEvent.save();
      console.log("[Audit Service] Simulated DB Tampering: Modifying EVT-2002-A2 directly.");
      return { success: true, message: "Log EVT-2002-A2 has been tampered." };
    }
    return { success: false, message: "Target log EVT-2002-A2 not found." };
  } catch (error) {
    console.error("[Audit Service] Tamper simulation failed:", error.message);
    return { success: false, error: error.message };
  }
};

// Admin utility: Recalculates and restores integrity hashes, fixing the database
const restoreLogData = async () => {
  try {
    const logs = await AuditLog.find();
    let restoredCount = 0;
    for (const log of logs) {
      const isOk = verifyIntegrity(log);
      if (!isOk || log.eventId === "EVT-2002-A2") {
        // Reset the tampered fields back to seeded values
        if (log.eventId === "EVT-2002-A2") {
          log.actor = "Admin (Atharv)";
          log.changes = {
            before: { role: "Developer" },
            after: { role: "Admin" }
          };
        }
        
        // Recalculate hash and signature
        log.hash = calculateHash(log);
        log.signature = calculateSignature(log.hash);
        log.isVerified = true;
        await log.save();
        restoredCount++;
      }
    }
    console.log(`[Audit Service] Restored integrity for ${restoredCount} logs.`);
    return { success: true, restoredCount };
  } catch (error) {
    console.error("[Audit Service] Restore failed:", error.message);
    return { success: false, error: error.message };
  }
};

// Performs a full database scan returning the total verified and tampered logs
const runFullIntegrityScan = async () => {
  try {
    const logs = await AuditLog.find();
    let total = 0;
    let verified = 0;
    let tampered = 0;
    const tamperedDetails = [];

    for (const log of logs) {
      total++;
      const isOk = verifyIntegrity(log);
      if (isOk && log.isVerified) {
        verified++;
      } else {
        tampered++;
        tamperedDetails.push({
          eventId: log.eventId,
          action: log.action,
          expectedHash: calculateHash(log),
          currentHash: log.hash
        });
        if (log.isVerified) {
          log.isVerified = false;
          await log.save();
        }
      }
    }

    const integrityPercent = total > 0 ? Math.round((verified / total) * 100) : 100;
    return {
      total,
      verified,
      tampered,
      integrityPercent,
      tamperedDetails
    };
  } catch (error) {
    console.error("[Audit Service] Integrity scan failed:", error.message);
    throw error;
  }
};

module.exports = {
  seedAuditLogs,
  calculateHash,
  calculateSignature,
  verifyIntegrity,
  tamperLogData,
  restoreLogData,
  runFullIntegrityScan
};
