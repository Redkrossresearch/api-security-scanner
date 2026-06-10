const Scan = require("./scan.model");

const Vulnerability = require("./vulnerability.model");

const { createReport, } = require("./report.service");

const { scanSecurityHeaders, } = require("./security-header.scanner");

const { scanSSL, } = require("./ssl.scanner");

const { scanCORS, } = require("./cors.scanner");

const { scanCookies, } = require("./cookie.scanner");

const { scanTechnology, } = require("./technology.scanner");

const { scanServerDisclosure, } = require("./server.scanner");

const { calculateSecurityScore, } = require("./security-score.engine");

const createScan = async (
    userId,
    targetUrl
) => {
    const scan = await Scan.create({
        userId,
        targetUrl,
        status: "running",
        startedAt: new Date(),
    });

    try {
        const headerFindings =
            await scanSecurityHeaders(
                targetUrl
            );

        const sslFindings =
            await scanSSL(
                targetUrl
            );

        const corsFindings =
            await scanCORS(
                targetUrl
            );

        const cookieFindings =
            await scanCookies(
                targetUrl
            );

        const technologyFindings =
            await scanTechnology(
                targetUrl
            );

        const serverFindings =
            await scanServerDisclosure(
                targetUrl
            );

        let findings = [
            ...headerFindings,
            ...sslFindings,
            ...corsFindings,
            ...cookieFindings,
            ...serverFindings,
            ...technologyFindings,
        ];

        const scoreData =
            calculateSecurityScore(
                findings
            );



        scan.vulnerabilities =
            findings;

        scan.securityScore =
            scoreData.score;

        scan.grade =
            scoreData.grade;

        scan.riskLevel =
            scoreData.riskLevel;

        scan.status =
            "completed";

        scan.completedAt =
            new Date();


        await Vulnerability.deleteMany({
            scanId: scan._id,
        });

        if (findings.length > 0) {

            await Vulnerability.insertMany(

                findings.map(
                    (finding) => ({
                        scanId: scan._id,

                        severity: finding.severity,
                        title: finding.title,
                        description: finding.description,
                        recommendation: finding.recommendation,

                        cwe: finding.cwe,
                        owasp: finding.owasp,

                        cvss: finding.cvss,

                        category: finding.category,

                        references: finding.references,

                        remediationSteps:
                            finding.remediationSteps,
                    })
                )

            );

        }
        await scan.save();
        await createReport(
            scan,
            findings
        );


        return scan;

    } catch (error) {

        scan.status = "failed";

        scan.completedAt =
            new Date();
        await scan.save();

        throw error;
    }
};

const getUserScans = async (
    userId
) => {
    return Scan.find({
        userId,
    }).sort({
        createdAt: -1,
    });
};

module.exports = {
    createScan,
    getUserScans,
};