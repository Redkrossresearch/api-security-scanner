const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const scanRoutes = require("./modules/scans/scan.routes");
const authRoutes = require("./modules/auth/auth.routes");
const env = require("./config/env");
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const vulnerabilityRoutes = require("./modules/vulnerabilities/vulnerability.routes");
const aiRoutes = require("./modules/ai/ai.routes");
const reportRoutes = require("./modules/reports/report.routes"); // ✅ Moved to top

const app = express();

// 🔴 Critical 1 — Trust Proxy (Required for Render/reverse proxy)
app.set("trust proxy", 1);

const allowedOrigins = ["http://localhost:5173", env.clientUrl].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
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

// 🔴 Critical 2 — JSON Payload Limit (Prevents large payload attacks)
app.use(express.json({ limit: "2mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
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