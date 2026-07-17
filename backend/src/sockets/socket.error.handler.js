const logger = require("./socket.logger");

const wrapSocketHandler = (socket, handler) => {
  return async (...args) => {
    try {
      await handler(...args);
    } catch (err) {
      logger.error(`Error in socket event handler: ${err.message}`, {
        userId: socket.user?._id,
        socketId: socket.id,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
      });

      try {
        socket.emit("error", {
          success: false,
          message: "An internal server error occurred in real-time channel.",
        });
      } catch (emitErr) {
        console.error("Failed to emit error to socket:", emitErr.message);
      }
    }
  };
};

module.exports = {
  wrapSocketHandler,
};
