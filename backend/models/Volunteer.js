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

  /* XP SYSTEM */
  xp: {
    type: Number,
    default: 0
  },

  level: {
    type: String,
    default: "Rookie"
  },

  completedCamps: {
    type: Number,
    default: 0
  },

  totalPeopleHelped: {
    type: Number,
    default: 0
  },

  totalHours: {
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
