const socketLogger = {
  info: (message, ...args) => {
    console.log(
      `[Socket.IO][INFO] [${new Date().toISOString()}] ${message}`,
      ...args,
    );
  },
  warn: (message, ...args) => {
    console.warn(
      `[Socket.IO][WARN] [${new Date().toISOString()}] ${message}`,
      ...args,
    );
  },
  error: (message, ...args) => {
    console.error(
      `[Socket.IO][ERROR] [${new Date().toISOString()}] ${message}`,
      ...args,
    );
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        `[Socket.IO][DEBUG] [${new Date().toISOString()}] ${message}`,
        ...args,
      );
    }
  },
};

module.exports = socketLogger;
