const { CACHE_TTL } = require("../modules/constants/dashboard.constants");

const dashboardCache = new Map();

setInterval(() => {
  const now = Date.now();

  for (const [key, value] of dashboardCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      dashboardCache.delete(key);
    }
  }
}, CACHE_TTL);

module.exports = {
  dashboardCache,
};