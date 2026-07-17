const mongoose = require("mongoose");
require("dotenv").config({ path: "backend/.env" });

const ScanSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId });
const Scan = mongoose.models.Scan || mongoose.model("Scan", ScanSchema, "scans");

const VulnerabilitySchema = new mongoose.Schema({
  scanId: mongoose.Schema.Types.ObjectId,
  severity: String,
  category: String,
  cvss: Number,
  endpoint: String,
  status: String,
  createdAt: Date
});
const Vulnerability = mongoose.models.Vulnerability || mongoose.model("Vulnerability", VulnerabilitySchema, "vulnerabilities");

async function run() {
  console.log("Connecting...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected.");

  const userId = new mongoose.Types.ObjectId("6a46c844f49d7a441c5494fa");

  console.time("userScanIds");
  const userScanIds = await Scan.find({ userId }).distinct("_id");
  console.timeEnd("userScanIds");
  console.log("userScanIds length:", userScanIds.length);

  const filter = { scanId: { $in: userScanIds } };

  console.time("vulnerabilitiesFetch");
  const vulnerabilities = await Vulnerability.find(filter).lean();
  console.timeEnd("vulnerabilitiesFetch");
  console.log("vulnerabilities length:", vulnerabilities.length);

  console.log("Evaluating counts...");
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  vulnerabilities.forEach((v) => {
    const sev = (v.severity || "medium").toLowerCase();
    if (counts[sev] !== undefined) counts[sev]++;
  });
  console.log("Counts:", counts);

  console.log("Disconnecting...");
  await mongoose.disconnect();
  console.log("Done.");
}

run().catch(e => console.error("Crash:", e));
