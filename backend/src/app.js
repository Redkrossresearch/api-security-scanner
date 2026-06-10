const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const scanRoutes = require("./modules/scans/scan.routes");
const authRoutes = require("./modules/auth/auth.routes");
const env = require("./config/env");
const dashboardRoutes =require("./modules/scans/dashboard.routes");
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  env.clientUrl,
].filter(Boolean);

app.use(
  
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Origin not allowed by CORS")
      );
    },
    credentials: true,
  })
);

const reportRoutes =
  require(
    "./modules/scans/report.routes"
  );

app.use(
  "/api/reports",
  reportRoutes
);

app.use(helmet());

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
app.use("/api/auth", authRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/scans",scanRoutes);

module.exports = app;