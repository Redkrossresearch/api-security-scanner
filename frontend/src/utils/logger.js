const logger = {
  error(error, context = "") {
    if (import.meta.env.DEV) {
      console.error(`[ERROR] ${context}:`, error);
    }

    // Future:
    // Sentry.captureException(error, { extra: { context } });
  },

  info(message) {
    if (import.meta.env.DEV) {
      console.log(message);
    }
  },
};

export default logger;