const axios = require("axios");

async function diagnose() {
  console.log("=== Diagnosing Local Backend Port 5000 ===");
  try {
    const res = await axios.get("http://localhost:5000/api/settings", { timeout: 3000 });
    console.log("Status:", res.status);
    console.log("Data:", res.data);
  } catch (err) {
    console.error("Error connecting to /api/settings:", err.message);
    if (err.response) {
      console.log("Response status:", err.response.status);
      console.log("Response data:", err.response.data);
    }
  }

  try {
    const res = await axios.get("http://localhost:5000/", { timeout: 3000 });
    console.log("Root status:", res.status);
  } catch (err) {
    console.error("Error connecting to root:", err.message);
  }
}

diagnose();
