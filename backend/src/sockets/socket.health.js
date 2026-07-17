const EVENTS = require("./socket.constants");
const logger = require("./socket.logger");
const os = require("os");

const startHealthMonitoring = (io) => {
  // Emit heartbeat to all connected clients every 30 seconds
  const heartbeatInterval = setInterval(() => {
    try {
      io.emit(EVENTS.SYSTEM_HEARTBEAT, { ts: new Date() });
    } catch (err) {
      logger.error(`Failed to emit heartbeat: ${err.message}`);
    }
  }, 30000);

  // Emit health metrics to admin room every 60 seconds
  const healthInterval = setInterval(() => {
    try {
      const freeMem = os.freemem();
      const totalMem = os.totalmem();
      const usage = totalMem - freeMem;
      const memPercentage = Math.round((usage / totalMem) * 100);

      const systemHealthPayload = {
        cpu: os.loadavg(),
        mem: {
          free: freeMem,
          total: totalMem,
          usagePercentage: memPercentage,
        },
        connections: io.engine.clientsCount,
        ts: new Date(),
      };

      io.to("room:admin").emit(EVENTS.SYSTEM_HEALTH, systemHealthPayload);
    } catch (err) {
      logger.error(`Failed to emit health status: ${err.message}`);
    }
  }, 60000);

  return () => {
    clearInterval(heartbeatInterval);
    clearInterval(healthInterval);
  };
};

module.exports = {
  startHealthMonitoring,
};
