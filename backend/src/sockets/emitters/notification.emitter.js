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

const emitNotification = (userId, payload) => {
  const io = getIoSafe();
  if (!io) return;
  const userRoom = getRoomNames.user(userId);
  io.to(userRoom).emit(EVENTS.NOTIFICATION_NEW, payload);
};

module.exports = {
  emitNotification,
};
