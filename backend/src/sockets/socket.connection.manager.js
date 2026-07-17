const userSockets = new Map(); // userId -> Set of socket.ids

const registerSocket = (userId, socket) => {
  const userIdStr = userId.toString();
  if (!userSockets.has(userIdStr)) {
    userSockets.set(userIdStr, new Set());
  }
  const sessions = userSockets.get(userIdStr);

  // Clean up any stale/disconnected sockets first
  const currentSocketIds = Array.from(sessions);
  for (const id of currentSocketIds) {
    const activeSocket = socket.server.sockets.sockets.get(id);
    if (!activeSocket || !activeSocket.connected) {
      sessions.delete(id);
    }
  }

  // Enforce session connection limit (cap to max 15 concurrent sockets per user)
  if (sessions.size >= 15) {
    const oldestSocketId = Array.from(sessions)[0];
    const oldestSocket = socket.server.sockets.sockets.get(oldestSocketId);
    if (oldestSocket) {
      console.log(
        `[connection-manager] Evicting oldest active socket ${oldestSocketId} for user ${userIdStr} due to limit (15)`,
      );
      oldestSocket.disconnect(true);
    }
    sessions.delete(oldestSocketId);
  }

  sessions.add(socket.id);
};

const unregisterSocket = (userId, socketId) => {
  if (!userId) return;
  const userIdStr = userId.toString();
  const sessions = userSockets.get(userIdStr);
  if (sessions) {
    sessions.delete(socketId);
    if (sessions.size === 0) {
      userSockets.delete(userIdStr);
    }
  }
};

const getUserSockets = (userId) => {
  const userIdStr = userId.toString();
  return Array.from(userSockets.get(userIdStr) || []);
};

module.exports = {
  registerSocket,
  unregisterSocket,
  getUserSockets,
};
