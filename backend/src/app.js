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
const app = express();

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

const reportRoutes = require("./modules/reports/report.routes");

app.use("/api/reports", reportRoutes);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

app.use(compression());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Security Scanner Backend Running",
  });
});
app.use("/api", apiLimiter);

app.use("/api/auth", authLimiter);

app.use("/api/auth", authRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/scans", scanRoutes);

app.use("/api/vulnerabilities", vulnerabilityRoutes);

app.use("/api/ai", aiRoutes);

module.exports = app;
