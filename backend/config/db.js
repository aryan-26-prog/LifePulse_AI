const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  try {
    // Set reliable DNS servers for SRV record lookup on Node.js / Windows environments
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
    } catch (dnsErr) {
      // Ignore if system restricts setting DNS servers
    }

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "lifepulse"   
    });

    console.log("✅ MongoDB Atlas Connected (lifepulse)");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
