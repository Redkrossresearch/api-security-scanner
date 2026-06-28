const app = require("./src/app");
const connectDB = require("./src/config/db");
const env = require("./src/config/env");

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed");
    console.error(error);
    process.exit(1);
  }
};

startServer();