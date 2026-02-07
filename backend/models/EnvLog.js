const mongoose = require("mongoose");

const envLogSchema = new mongoose.Schema({
  area: { type: String, required: true },
  aqi: Number,
  pollutants: {
    pm2_5: Number,
    pm10: Number,
    co: Number,
    no2: Number,
    o3: Number,
    so2: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("EnvLog", envLogSchema);
