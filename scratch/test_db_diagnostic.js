const mongoose = require("mongoose");
require("dotenv").config({ path: "backend/.env" });

async function diagnose() {
  console.log("=== DB Diagnostic Starting ===");
  const uri = process.env.MONGODB_URI;
  console.log("Connecting to:", uri);
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully!");

    const userCount = await mongoose.connection.db.collection("users").countDocuments();
    console.log("Users count:", userCount);

    const scanCount = await mongoose.connection.db.collection("scans").countDocuments();
    console.log("Scans count:", scanCount);

    const settingCount = await mongoose.connection.db.collection("settings").countDocuments();
    console.log("Settings count:", settingCount);

    const vulnCount = await mongoose.connection.db.collection("vulnerabilities").countDocuments();
    console.log("Vulnerabilities count:", vulnCount);

    // List recent scans
    const recentScans = await mongoose.connection.db.collection("scans").find().limit(3).toArray();
    console.log("Recent scans:", recentScans.map(s => ({ id: s._id, target: s.targetUrl, status: s.status })));

    // Fetch user details
    const user = await mongoose.connection.db.collection("users").findOne({ _id: new mongoose.Types.ObjectId("6a46c844f49d7a441c5494fa") });
    if (user) {
      console.log("Active user found:", user.email, "Name:", user.fullName);
    } else {
      console.log("Active user 6a46c844f49d7a441c5494fa NOT found!");
      const fallbackUser = await mongoose.connection.db.collection("users").findOne();
      if (fallbackUser) {
        console.log("Alternative user in DB:", fallbackUser._id, fallbackUser.email);
      }
    }

  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("=== DB Diagnostic Finished ===");
  }
}

diagnose();
