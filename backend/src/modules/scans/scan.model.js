const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        targetUrl: {
            type: String,
            required: true,
            trim: true,
        },

        scanId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        assetName: {
            type: String,
            trim: true,
            default: "",
        },

        profile: {
            type: String,
            default: "Full Security Audit",
        },

        environment: {
            type: String,
            enum: ["production", "staging", "development"],
            default: "production",
        },

        status: {
            type: String,
            enum: [
                "pending",
                "running",
                "completed",
                "failed",
            ],
            default: "pending",
        },

        // ✅ IMPROVEMENT 2: Added min/max validation
        securityScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },

        grade: {
            type: String,
            enum: [
                "A+",
                "A",
                "A-",
                "B+",
                "B",
                "C",
                "D",
                "F",
            ],
            default: "A",
        },

        // ✅ IMPROVEMENT 1: Added enum for riskLevel
        riskLevel: {
            type: String,
            enum: [
                "Critical",
                "High",
                "Medium",
                "Low",
            ],
            default: "Low",
        },

        // ✅ IMPROVEMENT 3: Added min/max validation
        riskScore: {
            type: Number,
            min: 0,
            max: 10,
            default: 0,
        },

        criticalCount: {
            type: Number,
            default: 0,
        },

        highCount: {
            type: Number,
            default: 0,
        },

        mediumCount: {
            type: Number,
            default: 0,
        },

        lowCount: {
            type: Number,
            default: 0,
        },

        totalFindings: {
            type: Number,
            default: 0,
        },

        vulnerabilities: [
            {
                title: String,

                severity: {
                    type: String,
                    enum: [
                        "critical",
                        "high",
                        "medium",
                        "low",
                        "info",
                    ],
                },

                status: {
                    type: String,
                    enum: [
                        "open",
                        "resolved",
                        "ignored",
                    ],
                    default: "open",
                },

                classification: {
                    type: String,
                    enum: [
                        "true_positive",
                        "false_positive",
                        "true_negative",
                        "false_negative",
                        "unclassified"
                    ],
                    default: "unclassified",
                },

                resolvedAt: Date,

                description: String,

                recommendation: String,

                cwe: String,

                owasp: String,

                cvss: Number,

                category: String,

                references: [
                    String,
                ],

                remediationSteps: [
                    String,
                ],

                detectedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        startedAt: Date,

        duration: {
            type: Number,
            default: 0,
        },

        completedAt: Date,
    },
    {
        timestamps: true,
    }
);

// ✅ Existing indexes
scanSchema.index({
    createdAt: -1,
});

scanSchema.index({
    userId: 1,
});

scanSchema.index({
    riskScore: -1,
});

scanSchema.index({
    assetName: 1,
});

scanSchema.index({
    status: 1,
});

// ✅ Sprint 3.1.1: Dashboard-specific compound indexes
scanSchema.index({
    createdAt: -1,
    securityScore: -1,
});

scanSchema.index({
    userId: 1,
    createdAt: -1,
});

scanSchema.index({
    riskLevel: 1,
    createdAt: -1,
});

scanSchema.index({
    grade: 1,
    createdAt: -1,
});

module.exports = mongoose.model(
    "Scan",
    scanSchema
);