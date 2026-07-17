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

const emitAiThinking = (userId, payload) => {
  const io = getIoSafe();
  if (!io) {
    console.log("[ai-emitter] getIoSafe() returned null");
    return;
  }
  const userRoom = getRoomNames.user(userId);
  console.log(`[ai-emitter] emitAiThinking room: "${userRoom}"`, payload);
  io.to(userRoom).emit(EVENTS.AI_THINKING, payload);
};

const emitAiStreamStart = (userId, payload) => {
  const io = getIoSafe();
  if (!io) return;
  const userRoom = getRoomNames.user(userId);
  console.log(`[ai-emitter] emitAiStreamStart room: "${userRoom}"`, payload);
  io.to(userRoom).emit(EVENTS.AI_STREAM_START, payload);
};

const emitAiStream = (userId, payload) => {
  const io = getIoSafe();
  if (!io) return;
  const userRoom = getRoomNames.user(userId);
  console.log(
    `[ai-emitter] emitAiStream room: "${userRoom}" token:`,
    payload.text?.slice(0, 10),
  );
  io.to(userRoom).emit(EVENTS.AI_STREAM, payload);
};

const emitAiStreamEnd = (userId, payload) => {
  const io = getIoSafe();
  if (!io) return;
  const userRoom = getRoomNames.user(userId);
  console.log(
    `[ai-emitter] emitAiStreamEnd room: "${userRoom}"`,
    payload.text?.slice(0, 10),
  );
  io.to(userRoom).emit(EVENTS.AI_STREAM_END, payload);
};

module.exports = {
  emitAiThinking,
  emitAiStreamStart,
  emitAiStream,
  emitAiStreamEnd,
};
