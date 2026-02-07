const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema({

  name: String,
  phone: String,

  available: {
    type: Boolean,
    default: true
  },

  assignedCamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ReliefCamp",
    default: null
  },

  completedCamps: {
    type: Number,
    default: 0
  },

  badges: [
    {
      name: String,
      icon: String,
      description: String
    }
  ]
});

module.exports = mongoose.model("Volunteer", volunteerSchema);
