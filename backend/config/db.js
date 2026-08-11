const mongoose = require("mongoose");
const dns = require("dns");

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    if (dns.setDefaultResultOrder) {
      dns.setDefaultResultOrder("ipv4first");
    }

    try {
      dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
    } catch (dnsErr) {
      // Ignore if system restricts setting DNS servers
    }

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "lifepulse",
      family: 4
    });

    isConnected = true;
    console.log("✅ MongoDB Atlas Connected (lifepulse)");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    throw err;
  }
};

module.exports = connectDB;
