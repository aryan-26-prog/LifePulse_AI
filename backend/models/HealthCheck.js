const mongoose = require("mongoose");

const healthSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
  sleep: Number,
  stress: Number,
  symptoms: [String],
  location: {
    lat: Number,
    lng: Number,
    area: String
  },
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model("HealthCheck", healthSchema);