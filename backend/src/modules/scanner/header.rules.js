const HEADER_RULES = [
  {
    header: "content-security-policy",

    vulnerability: "MISSING_CSP",
  },

  {
    header: "strict-transport-security",

    vulnerability: "MISSING_HSTS",
  },

  {
    header: "x-frame-options",

    vulnerability: "MISSING_X_FRAME_OPTIONS",
  },

  {
    header: "x-content-type-options",

    vulnerability: "MISSING_X_CONTENT_TYPE_OPTIONS",
  },

  {
    header: "referrer-policy",

    vulnerability: "MISSING_REFERRER_POLICY",
  },
];

module.exports = {
  HEADER_RULES,
};
