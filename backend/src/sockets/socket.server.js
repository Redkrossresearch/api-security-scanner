const { Server } = require("socket.io");
const env = require("../config/env");
const { isOriginAllowed } = require("../config/cors.util");
const socketAuthMiddleware = require("./socket.auth.middleware");
const connectionManager = require("./socket.connection.manager");
const { registerSocketEvents } = require("./socket.event.registry");
const { startHealthMonitoring } = require("./socket.health");
const { handleSocketDisconnect } = require("./socket.cleanup");
const logger = require("./socket.logger");

// Future-proofing Redis Adapter imports:
// const { createAdapter } = require("@socket.io/redis-adapter");
// const { getRedisClient } = require("../queue/redis.client");

let ioInstance = null;

const createSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || isOriginAllowed(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Origin not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 20000,
    pingInterval: 20000,
  });

  /*
   * ROADMAP: Horizontal Scaling via Redis Adapter
   * To enable cluster / multi-instance Socket.IO, uncomment the block below:
   *
   * const pubClient = getRedisClient();
   * const subClient = pubClient.duplicate();
   * io.adapter(createAdapter(pubClient, subClient));
   * logger.info("Socket.IO Redis adapter enabled successfully.");
   */

  // Attach jwt auth middleware
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    logger.info(
      `New client connected: ${socket.id} (user: ${socket.user?._id})`,
    );

    // Register user socket session
    connectionManager.registerSocket(socket.user._id, socket);

    // Join user's individual room by default
    const uRoom = `user:${socket.user._id}`;
    socket.join(uRoom);
    console.log(`[socket-server] Socket ${socket.id} joined room "${uRoom}"`);

    // Flush any offline buffered events
    const reconnectionManager = require("./socket.reconnection.manager");
    reconnectionManager.flushEvents(socket.user._id, socket);

    // Register event listeners
    registerSocketEvents(io, socket);

    // Handle disconnect
    socket.on("disconnect", () => {
      handleSocketDisconnect(socket);
    });
  });

  // Start periodic system heartbeats
  startHealthMonitoring(io);

  ioInstance = io;
  return io;
};

const getIo = () => {
  if (!ioInstance) {
    throw new Error("Socket.io has not been initialized yet!");
  }
  return ioInstance;
};

module.exports = {
  createSocketServer,
  getIo,
};
