// ✅ Sprint 5.6: Dashboard Constants - Centralized configuration

// Projection constants for MongoDB queries
const SCAN_FIELDS = "targetUrl securityScore riskLevel grade createdAt";

const LATEST_SCAN_FIELDS =
  "_id targetUrl securityScore grade riskLevel createdAt";

const CRITICAL_FIELDS = "title severity status createdAt apiName targetUrl";

// Cache configuration
const CACHE_TTL = 60 * 1000; // 60 seconds

module.exports = {
  SCAN_FIELDS,
  LATEST_SCAN_FIELDS,
  CRITICAL_FIELDS,
  CACHE_TTL,
};
