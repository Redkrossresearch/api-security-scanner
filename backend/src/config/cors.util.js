const env = require("./env");

const allowedOrigins = ["http://localhost:5173", env.clientUrl].filter(Boolean);

// Normalize URL by trimming trailing slashes, whitespace, and converting to lowercase
const normalizeUrl = (url) => {
  if (!url) return "";
  return url.trim().replace(/\/+$/, "").toLowerCase();
};

const normalizedAllowedOrigins = allowedOrigins.map(normalizeUrl);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  const normalized = normalizeUrl(origin);
  return normalizedAllowedOrigins.includes(normalized);
};

module.exports = {
  allowedOrigins,
  isOriginAllowed,
  normalizeUrl,
};
