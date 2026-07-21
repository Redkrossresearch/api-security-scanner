class Logger {
  constructor(moduleName = "app") {
    this.moduleName = moduleName;
  }

  log(level, message, meta = {}) {
    const config = require("../config/env");
    const sanitizedMeta = config.sanitizeSecrets ? config.sanitizeSecrets(meta) : meta;

    const logObj = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      module: this.moduleName,
      message,
      correlationId: sanitizedMeta.correlationId || sanitizedMeta.requestId || undefined,
      ...sanitizedMeta,
    };

    if (process.env.NODE_ENV === "production") {
      console.log(JSON.stringify(logObj));
    } else {
      const corrStr = logObj.correlationId ? ` [${logObj.correlationId}]` : "";
      console.log(
        `[${logObj.timestamp}] [${logObj.level}] [${logObj.module}]${corrStr} ${message}`,
        Object.keys(sanitizedMeta).length > 0 ? (sanitizedMeta.correlationId ? { ...sanitizedMeta, correlationId: undefined } : sanitizedMeta) : ""
      );
    }
  }

  info(message, meta) {
    this.log("info", message, meta);
  }

  warn(message, meta) {
    this.log("warn", message, meta);
  }

  error(message, meta) {
    this.log("error", message, meta);
  }

  debug(message, meta) {
    this.log("debug", message, meta);
  }
}

module.exports = (moduleName) => new Logger(moduleName);
