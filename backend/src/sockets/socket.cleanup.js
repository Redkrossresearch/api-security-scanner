const connectionManager = require("./socket.connection.manager");
const logger = require("./socket.logger");

const handleSocketDisconnect = (socket) => {
  try {
    const userId = socket.user?._id;
    if (userId) {
      // Sprints 18-22: Broadcast leave presence to active team rooms before closing
      if (socket.rooms) {
        for (const room of socket.rooms) {
          if (room.startsWith("team:")) {
            socket.to(room).emit("presence:leave", {
              userId: userId.toString(),
              email: socket.user.email,
            });
          }
        }
      }

      connectionManager.unregisterSocket(userId, socket.id);
      logger.info(`Socket disconnected: ${socket.id} (user: ${userId})`);
    } else {
      logger.info(`Socket disconnected (unauthenticated): ${socket.id}`);
    }
  } catch (err) {
    logger.error(`Error during socket disconnect cleanup: ${err.message}`);
  }
};

module.exports = {
  handleSocketDisconnect,
};
