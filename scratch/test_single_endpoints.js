const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config({ path: "backend/.env" });

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "athx_access_secret_token";
const userId = "6a46c844f49d7a441c5494fa";
const token = jwt.sign({ id: userId }, JWT_ACCESS_SECRET, { expiresIn: "1h" });

async function test(ep) {
  const client = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`Testing ${ep}...`);
  try {
    const start = Date.now();
    const res = await client.get(ep, { timeout: 10000 });
    console.log(`✅ ${ep} -> ${res.status} in ${Date.now() - start}ms`);
  } catch (err) {
    console.log(`❌ ${ep} failed: ${err.message}`);
  }
}

async function run() {
  await test("/scans/dashboard/summary");
  await test("/settings");
  await test("/vulnerabilities/intelligence");
  await test("/vulnerabilities?page=1&limit=8");
  await test("/reports");
  await test("/copilot/memories");
}

run();
