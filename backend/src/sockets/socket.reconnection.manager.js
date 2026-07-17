class SocketReconnectionManager {
  constructor() {
    this.buffer = {}; // Map of userId -> Array of { eventName, payload }
  }

  /**
   * Buffer an event payload for a disconnected user
   */
  queueEvent(userId, eventName, payload) {
    const key = userId.toString();
    if (!this.buffer[key]) {
      this.buffer[key] = [];
    }
    
    // Cap buffer size at 50 messages to avoid memory leak
    if (this.buffer[key].length < 50) {
      this.buffer[key].push({ eventName, payload, timestamp: new Date() });
      console.log(`[socket-reconnect] Buffered event "${eventName}" for offline user ${key}`);
    }
  }

  /**
   * Flush all buffered events to a newly connected socket
   */
  flushEvents(userId, socket) {
    const key = userId.toString();
    const queued = this.buffer[key];
    
    if (queued && queued.length > 0) {
      console.log(`[socket-reconnect] Flushing ${queued.length} buffered event(s) to user ${key}`);
      for (const item of queued) {
        socket.emit(item.eventName, item.payload);
      }
      // Clear queue
      delete this.buffer[key];
    }
  }

  /**
   * Clear user queue
   */
  clear(userId) {
    delete this.buffer[userId.toString()];
  }
}

module.exports = new SocketReconnectionManager();
