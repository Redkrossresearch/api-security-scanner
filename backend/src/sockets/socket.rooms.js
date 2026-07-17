const getRoomNames = {
  user: (userId) => `user:${userId}`,
  scan: (scanId) => `scan:${scanId}`,
  team: (teamId) => `team:${teamId}`,
};

module.exports = getRoomNames;
