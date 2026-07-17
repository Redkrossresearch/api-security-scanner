const express = require("express");
const http = require("http");
const { io: Client } = require("socket.io-client");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Mock mongoose connection so it doesn't connect to real MongoDB
mongoose.connect = async () => {
  console.log("Mocked MongoDB Connected");
};
mongoose.connection = {
  close: async () => {
    console.log("Mocked MongoDB connection closed");
  }
};

// Require User model and mock findOne
const User = require("../backend/src/modules/auth/auth.model");
User.findOne = () => {
  return {
    select: () => ({
      lean: async () => {
        return {
          _id: "60c72b2f9b1d8a23c8f8b898",
          name: "Socket Test User",
          email: "test-socket-eviction@example.com",
          role: "analyst"
        };
      }
    })
  };
};

const env = require("../backend/src/config/env");
const { createSocketServer } = require("../backend/src/sockets/socket.server");

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(env.mongoUri);
  console.log("Connected to MongoDB.");

  const dummyUserId = "60c72b2f9b1d8a23c8f8b898";

  // Create token
  const token = jwt.sign({ id: dummyUserId }, env.jwtAccessSecret, { expiresIn: "1h" });
  console.log(`Generated JWT for dummy user`);

  // Boot a test socket server on port 5005
  const app = express();
  const server = http.createServer(app);
  const io = createSocketServer(server);

  await new Promise((resolve) => server.listen(5005, resolve));
  console.log("Test server listening on port 5005");

  const clients = [];
  const connectClient = (index) => {
    return new Promise((resolve, reject) => {
      const socket = Client("http://localhost:5005", {
        auth: { token },
        transports: ["websocket"]
      });

      socket.on("connect", () => {
        console.log(`[Client ${index}] Connected as socket ID: ${socket.id}`);
        resolve(socket);
      });

      socket.on("connect_error", (err) => {
        console.error(`[Client ${index}] Connection error:`, err.message);
        reject(err);
      });

      socket.on("disconnect", (reason) => {
        console.log(`[Client ${index}] Disconnected: ${reason}`);
      });
    });
  };

  try {
    // 1. Connect 10 clients (limit is 10)
    console.log("\n--- Connecting 10 clients ---");
    for (let i = 1; i <= 10; i++) {
      const socket = await connectClient(i);
      clients.push(socket);
    }
    console.log(`Currently connected clients count: ${clients.length}`);

    // Wait a brief moment to ensure registration completes
    await new Promise((r) => setTimeout(r, 1000));

    // 2. Connect 11th client. This should trigger eviction of the oldest (client 1).
    console.log("\n--- Connecting 11th client (should evict Client 1) ---");
    let client1Evicted = false;
    clients[0].on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        client1Evicted = true;
        console.log("✅ Verified: Client 1 was evicted by server disconnect.");
      }
    });

    const socket11 = await connectClient(11);
    clients.push(socket11);

    await new Promise((r) => setTimeout(r, 1500));

    if (!client1Evicted) {
      throw new Error("Client 1 was not evicted!");
    }

    // 3. Disconnect one of the active clients (e.g. client 2)
    console.log("\n--- Disconnecting Client 2 manually ---");
    clients[1].disconnect();
    await new Promise((r) => setTimeout(r, 1000));

    // Currently we should have:
    // Client 1: evicted (stale)
    // Client 2: disconnected manually (stale)
    // Clients 3-11: active (9 active sockets)
    // 4. Connect 12th client. This should clean up stale sockets (1 and 2), and NOT evict any active ones!
    console.log("\n--- Connecting 12th client (should NOT evict any active socket because Client 2 was stale) ---");
    let anyEvicted = false;
    for (let i = 2; i < 11; i++) {
      clients[i].on("disconnect", (reason) => {
        if (reason === "io server disconnect") {
          anyEvicted = true;
          console.error(`❌ Unexpected eviction: Client ${i + 1} was evicted!`);
        }
      });
    }

    const socket12 = await connectClient(12);
    clients.push(socket12);

    await new Promise((r) => setTimeout(r, 1500));

    if (anyEvicted) {
      throw new Error("Active client was unexpectedly evicted when stale slots were available!");
    } else {
      console.log("✅ Verified: Stale sockets were cleaned up first, and no active clients were evicted!");
    }

    console.log("\n🎉 All eviction tests completed successfully!");
  } finally {
    // Clean up
    console.log("\nCleaning up connections and closing server...");
    for (const client of clients) {
      if (client.connected) client.disconnect();
    }
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
    console.log("Server closed and database connection closed.");
  }
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
