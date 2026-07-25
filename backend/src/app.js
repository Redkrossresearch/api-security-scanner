const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const scanRoutes = require("./modules/scans/scan.routes");
const authRoutes = require("./modules/auth/auth.routes");
const env = require("./config/env");
const { isOriginAllowed } = require("./config/cors.util");
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const vulnerabilityRoutes = require("./modules/vulnerabilities/vulnerability.routes");
const aiRoutes = require("./modules/ai/ai.routes");
const reportRoutes = require("./modules/reports/report.routes"); // ✅ Moved to top
const settingRoutes = require("./modules/settings/setting.routes");
const copilotRoutes = require("./modules/copilot/copilot.routes");
const historyRoutes = require("./modules/history/history.routes");
const queueRoutes = require("./modules/queue/queue.routes");
const teamRoutes = require("./modules/teams/team.routes");
const autonomousRoutes = require("./modules/llm/autonomous/autonomous.routes");
const workflowRoutes = require("./modules/workflows/workflow.routes");
const mcpRoutes = require("./modules/mcp/mcp.routes");
const ragRoutes = require("./modules/llm/rag/rag.routes");
const auditRoutes = require("./modules/audit/audit.routes");
const requestLogger = require("./middleware/requestLogger");
const auditLoggerMiddleware = require("./middleware/auditLogger");

const app = express();

app.use(requestLogger);
app.use(auditLoggerMiddleware);

// Disable ETag to prevent HTTP 304 Not Modified responses and force HTTP 200 OK
app.disable("etag");

// 🔴 Critical 1 — Trust Proxy (Required for Render/reverse proxy)
app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isOriginAllowed(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);

// ✅ reportRoutes require removed from here

app.use("/api/reports", reportRoutes);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

app.use(compression());

app.use(morgan("dev"));

// 🔴 Critical 2 — JSON Payload Limit (Supports large file analysis up to 50MB)
app.use(express.json({ limit: "50mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  }),
);


app.use(cookieParser());

// 🟡 Recommended 1 — Enhanced Health Route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    service: "API Security Scanner",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", apiLimiter);

app.use("/api/auth", authLimiter);

app.use("/api/auth", authRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/scans", scanRoutes);

app.use("/api/vulnerabilities", vulnerabilityRoutes);

app.use("/api/ai", aiRoutes);

app.use("/api/settings", settingRoutes);
app.use("/api/copilot", copilotRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/autonomous", autonomousRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/mcp", mcpRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/audit-logs", auditRoutes);

// 🟡 Recommended 2 — 404 Handler (Express 5 compatible - no "*" wildcard)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// 🟢 Optional — Global Error Handler (Must be at the VERY END)
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
