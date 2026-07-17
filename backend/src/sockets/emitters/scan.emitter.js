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

const emitScanStart = (scanId, userId, payload) => {
  const io = getIoSafe();
  if (!io) return;
  const scanRoom = getRoomNames.scan(scanId);
  const userRoom = getRoomNames.user(userId);
  io.to(scanRoom).to(userRoom).emit(EVENTS.SCAN_START, payload);
};

const emitScanProgress = (scanId, payload) => {
  const io = getIoSafe();
  if (!io) return;
  const scanRoom = getRoomNames.scan(scanId);
  io.to(scanRoom).emit(EVENTS.SCAN_PROGRESS, payload);
};

const emitScanLog = (scanId, payload) => {
  const io = getIoSafe();
  if (!io) return;
  const scanRoom = getRoomNames.scan(scanId);
  io.to(scanRoom).emit(EVENTS.SCAN_LOG, payload);
};

const emitVulnerability = (scanId, payload) => {
  const io = getIoSafe();
  if (!io) return;
  const scanRoom = getRoomNames.scan(scanId);
  io.to(scanRoom).emit(EVENTS.SCAN_VULNERABILITY, payload);
};

const emitScanCompleted = (scanId, userId, payload) => {
  const io = getIoSafe();
  if (!io) return;
  const scanRoom = getRoomNames.scan(scanId);
  const userRoom = getRoomNames.user(userId);
  io.to(scanRoom).to(userRoom).emit(EVENTS.SCAN_COMPLETED, payload);
};

const emitScanFailed = (scanId, userId, payload) => {
  const io = getIoSafe();
  if (!io) return;
  const scanRoom = getRoomNames.scan(scanId);
  const userRoom = getRoomNames.user(userId);
  io.to(scanRoom).to(userRoom).emit(EVENTS.SCAN_FAILED, payload);
};

module.exports = {
  emitScanStart,
  emitScanProgress,
  emitScanLog,
  emitVulnerability,
  emitScanCompleted,
  emitScanFailed,
};
