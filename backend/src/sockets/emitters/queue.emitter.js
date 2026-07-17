const EVENTS = require("../socket.constants");
const getRoomNames = require("../socket.rooms");
const { getIo } = require("../socket.server");

const getIoSafe = () => {
  try {
    return getIo();
  } catch (err) {
    return null;
  }
};

const emitQueueUpdate = (userId, payload) => {
  const io = getIoSafe();
  if (!io) return;
  const userRoom = getRoomNames.user(userId);
  io.to(userRoom).emit(EVENTS.QUEUE_UPDATE, payload);
};

const emitQueuePosition = (scanId, payload) => {
  const io = getIoSafe();
  if (!io) return;
  const scanRoom = getRoomNames.scan(scanId);
  io.to(scanRoom).emit(EVENTS.QUEUE_POSITION, payload);
};

module.exports = {
  emitQueueUpdate,
  emitQueuePosition,
};
