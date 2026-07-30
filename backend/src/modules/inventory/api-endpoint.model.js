const mongoose = require("mongoose");

const parameterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, enum: ["query", "path", "body", "header"], default: "query" },
    paramType: { type: String, default: "string" },
    required: { type: Boolean, default: false },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const apiEndpointSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
      default: "GET",
      uppercase: true,
      index: true,
    },
    host: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    protocol: {
      type: String,
      enum: ["REST", "GraphQL", "gRPC", "WebSocket"],
      default: "REST",
      index: true,
    },
    authType: {
      type: String,
      enum: ["Public / Unauthenticated", "Bearer JWT", "OAuth2", "API Key", "Basic Auth"],
      default: "Public / Unauthenticated",
      index: true,
    },
    status: {
      type: String,
      enum: ["Active", "Shadow API", "Zombie Endpoint", "Deprecated"],
      default: "Active",
      index: true,
    },
    dataSensitivity: [
      {
        type: String,
        enum: ["PII", "Financial", "AuthToken", "Public", "Internal"],
        default: "Public",
      },
    ],
    riskScore: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low", "Secure"],
      default: "Low",
      index: true,
    },
    vulnerabilitiesCount: {
      type: Number,
      default: 0,
    },
    vulnerabilities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vulnerability",
      },
    ],
    parameters: [parameterSchema],
    headers: [
      {
        key: String,
        value: String,
      },
    ],
    sampleRequest: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    sampleResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    scannedInScans: [
      {
        type: String,
        index: true,
      },
    ],
    lastScannedAt: {
      type: Date,
      default: Date.now,
    },
    tags: [
      {
        type: String,
      },
    ],
    owner: {
      type: String,
      default: "Security Operations",
    },
    notes: {
      type: String,
      default: "",
    },
    // 30-Point Deep Pipeline Metadata Fields
    technology: {
      type: String,
      default: "Unknown",
    },
    contentType: {
      type: String,
      default: "application/json",
    },
    apiVersion: {
      type: String,
      default: "v1",
    },
    responseTimeMs: {
      type: Number,
      default: 0,
    },
    corsEnabled: {
      type: Boolean,
      default: false,
    },
    rateLimitPresent: {
      type: Boolean,
      default: false,
    },
    cdnGateway: {
      type: String,
      default: "Direct Server",
    },
    isSwagger: {
      type: Boolean,
      default: false,
    },
    isGraphQL: {
      type: Boolean,
      default: false,
    },
    jsonSchema: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Resource Classification & Verification Engine Fields
    resourceType: {
      type: String,
      enum: ["REST API", "GraphQL", "WebSocket", "SSE Stream", "gRPC-Web", "WebHook", "SOAP API", "Web Page", "Sitemap", "Static Asset", "Unknown"],
      default: "REST API",
      index: true,
    },
    isVerifiedApi: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique endpoint path + method + host
apiEndpointSchema.index({ host: 1, path: 1, method: 1 }, { unique: true });

const ApiEndpoint = mongoose.model("ApiEndpoint", apiEndpointSchema);

module.exports = ApiEndpoint;
