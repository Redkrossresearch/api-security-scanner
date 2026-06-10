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

        securityScore: {
            type: Number,
            default: 0,
        },

        grade: {
            type: String,
            default: "A",
        },

        riskLevel: {
            type: String,
            default: "Low",
        },

        vulnerabilities: [
            {
                title: String,

                severity: String,

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
            },
        ],

        startedAt: Date,

        completedAt: Date,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Scan",
    scanSchema
);