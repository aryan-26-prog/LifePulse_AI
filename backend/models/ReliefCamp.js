const mongoose = require("mongoose");

const reliefCampSchema = new mongoose.Schema({
  area: {
    type: String,
    required: true
  },

  lat: Number,
  lng: Number,

  // UPDATED ENUM
  riskLevel: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "SEVERE"],
    required: true
  },

  status: {
    type: String,
    enum: ["PENDING", "ACTIVE", "CLOSED"],
    default: "PENDING"
  },

  resources: {
    masks: Number,
    medicines: Number,
    oxygen: Number
  },

  volunteerAssigned: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volunteer"
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ReliefCamp", reliefCampSchema);
