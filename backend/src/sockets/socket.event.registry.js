const Scan = require("../modules/scans/scan.model");
const Team = require("../modules/teams/team.model");
const AuditLog = require("../modules/teams/audit.model");
const mongoose = require("mongoose");
const getRoomNames = require("./socket.rooms");
const EVENTS = require("./socket.constants");
const logger = require("./socket.logger");
const { wrapSocketHandler } = require("./socket.error.handler");

const registerSocketEvents = (io, socket) => {
  // join scan room handler
  socket.on(
    "scan:join",
    wrapSocketHandler(socket, async (payload) => {
      const { scanId } = payload || {};
      if (!scanId) {
        return socket.emit("error", {
          message: "scanId is required to join scan room",
        });
      }

      const isObjectId = mongoose.Types.ObjectId.isValid(scanId);
      const query = isObjectId ? { _id: scanId } : { scanId: scanId };

      const scan = await Scan.findOne(query).lean();
      if (!scan) {
        return socket.emit("error", { message: `Scan not found: ${scanId}` });
      }

      // Verify ownership
      let isAuthorized = false;
      if (
        scan.userId &&
        scan.userId.toString() === socket.user._id.toString()
      ) {
        isAuthorized = true;
      } else if (scan.teamId) {
        const team = await Team.findOne({
          _id: scan.teamId,
          "members.userId": socket.user._id,
        }).lean();
        if (team) {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        return socket.emit("error", {
          message: "Unauthorized to view this scan's real-time events",
        });
      }

      const roomName = getRoomNames.scan(scan._id.toString());
      socket.join(roomName);
      logger.info(`Socket ${socket.id} joined room ${roomName}`);
      socket.emit("scan:joined", { scanId: scan._id.toString() });
    }),
  );

  socket.on(
    "scan:leave",
    wrapSocketHandler(socket, async (payload) => {
      const { scanId } = payload || {};
      if (!scanId) return;

      // Resolve ID if it's not a Mongoose ID
      const isObjectId = mongoose.Types.ObjectId.isValid(scanId);
      let resolvedId = scanId;
      if (!isObjectId) {
        const scan = await Scan.findOne({ scanId }).lean();
        if (scan) {
          resolvedId = scan._id.toString();
        }
      }
      const roomName = getRoomNames.scan(resolvedId);
      socket.leave(roomName);
      logger.info(`Socket ${socket.id} left room ${roomName}`);
    }),
  );

  // queue room join/leave
  socket.on(
    "queue:join",
    wrapSocketHandler(socket, async () => {
      const roomName = getRoomNames.user(socket.user._id.toString());
      socket.join(roomName);
      logger.info(`Socket ${socket.id} joined queue room ${roomName}`);
      socket.emit("queue:joined", { userId: socket.user._id.toString() });
    }),
  );

  socket.on(
    "queue:leave",
    wrapSocketHandler(socket, async () => {
      const roomName = getRoomNames.user(socket.user._id.toString());
      socket.leave(roomName);
      logger.info(`Socket ${socket.id} left queue room ${roomName}`);
    }),
  );

  // Sprint 17: Multi-tenant room isolation + Sprint 20: Audit logs
  socket.on(
    "team:join",
    wrapSocketHandler(socket, async (payload) => {
      const { teamId } = payload || {};
      if (!teamId) {
        return socket.emit("error", { message: "teamId is required to join team room" });
      }
      const team = await Team.findOne({
        _id: teamId,
        "members.userId": socket.user._id,
      }).lean();
      if (!team) {
        return socket.emit("error", { message: "Unauthorized to join this team room" });
      }

      const roomName = getRoomNames.team(teamId);
      socket.join(roomName);
      logger.info(`Socket ${socket.id} joined team room ${roomName}`);

      // Log join action to AuditLog database
      await AuditLog.create({
        teamId: team._id,
        userId: socket.user._id,
        action: "SOCKET_JOIN_TEAM",
        details: { socketId: socket.id, room: roomName },
        ipAddress: socket.handshake.address || "",
      });

      socket.emit("team:joined", { teamId });
    }),
  );

  socket.on(
    "team:leave",
    wrapSocketHandler(socket, async (payload) => {
      const { teamId } = payload || {};
      if (!teamId) return;

      const roomName = getRoomNames.team(teamId);
      socket.leave(roomName);
      logger.info(`Socket ${socket.id} left team room ${roomName}`);

      // Log leave action to AuditLog database
      await AuditLog.create({
        teamId: mongoose.Types.ObjectId.isValid(teamId) ? teamId : new mongoose.Types.ObjectId(),
        userId: socket.user._id,
        action: "SOCKET_LEAVE_TEAM",
        details: { socketId: socket.id, room: roomName },
        ipAddress: socket.handshake.address || "",
      });
    }),
  );

  // Sprints 18 & 19: Collaborative Editing & Live Cursors
  socket.on(
    "presence:update",
    wrapSocketHandler(socket, async (payload) => {
      const { teamId, scanId, page, elementId, cursorPosition } = payload || {};
      if (!teamId) return;

      const roomName = getRoomNames.team(teamId);
      // Broadcast user presence context and position coordinates to other team members in room
      socket.to(roomName).emit("presence:broadcast", {
        userId: socket.user._id.toString(),
        email: socket.user.email,
        scanId,
        page,
        elementId,
        cursorPosition,
      });
    }),
  );
};

module.exports = {
  registerSocketEvents,
};
