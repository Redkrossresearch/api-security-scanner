const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config({ path: "backend/.env" });

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "athx_access_secret_token";
const userId = "6a46c844f49d7a441c5494fa";

console.log("JWT Access Secret:", JWT_ACCESS_SECRET);
const token = jwt.sign({ id: userId }, JWT_ACCESS_SECRET, { expiresIn: "1h" });
console.log("Generated Token:", token);

async function testEndpoints() {
  const client = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` }
  });

  const endpoints = [
    "/scans/dashboard/summary",
    "/settings",
    "/vulnerabilities/intelligence",
    "/vulnerabilities?page=1&limit=8",
    "/reports"
  ];

  for (const ep of endpoints) {
    console.log(`\nTesting GET ${ep}...`);
    try {
      const res = await client.get(ep);
      console.log(`✅ Success status: ${res.status}`);
      console.log("Sample Data:", JSON.stringify(res.data).slice(0, 200));
    } catch (err) {
      console.error(`❌ Failed: ${err.message}`);
      if (err.response) {
        console.log(`Response Status: ${err.response.status}`);
        console.log("Response Data:", err.response.data);
      }
    }
  }
}

testEndpoints();
