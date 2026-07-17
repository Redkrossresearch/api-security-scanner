const SEVERITY_RANGES = {
  critical: {
    min: 9.0,
    max: 10.0,
  },

  high: {
    min: 7.0,
    max: 8.9,
  },

  medium: {
    min: 4.0,
    max: 6.9,
  },

  low: {
    min: 0.1,
    max: 3.9,
  },

  info: {
    min: 0.0,
    max: 0.0,
  },
};

module.exports = {
  SEVERITY_RANGES,
};
