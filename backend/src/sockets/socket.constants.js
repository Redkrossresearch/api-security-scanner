const EVENTS = {
  CONNECTION_STATUS: "connection:status",
  SCAN_START: "scan:start",
  SCAN_PROGRESS: "scan:progress",
  SCAN_LOG: "scan:log",
  SCAN_VULNERABILITY: "scan:vulnerability",
  SCAN_COMPLETED: "scan:completed",
  SCAN_FAILED: "scan:failed",
  QUEUE_UPDATE: "queue:update",
  QUEUE_POSITION: "queue:position",
  AI_THINKING: "ai:thinking",
  AI_STREAM_START: "ai:stream:start",
  AI_STREAM: "ai:stream",
  AI_STREAM_END: "ai:stream:end",
  DASHBOARD_UPDATE: "dashboard:update",
  NOTIFICATION_NEW: "notification:new",
  SYSTEM_HEARTBEAT: "system:heartbeat",
  SYSTEM_HEALTH: "system:health",
};

module.exports = EVENTS;
