const crypto = require("crypto");
const logger = require("../utils/logger")("http");

const requestLogger = (req, res, next) => {
  const correlationId = req.headers["x-correlation-id"] || crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader("X-Correlation-ID", correlationId);

  const start = Date.now();
  const { method, url, ip } = req;
  const userAgent = req.headers["user-agent"] || "Unknown";

  logger.info(`${method} ${url} request started`, { correlationId, ip, userAgent });

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    logger.info(`${method} ${url} request ended with ${statusCode} in ${duration}ms`, {
      correlationId,
      statusCode,
      duration,
    });
  });

  next();
};

module.exports = requestLogger;
