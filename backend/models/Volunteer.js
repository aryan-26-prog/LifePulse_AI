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

  // ⭐ NEW FIELDS
  completedCamps: {
    type: Number,
    default: 0
  },

  badges: [
    {
      name: String,
      icon: String,
      description: String,
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
});


module.exports = mongoose.model("Volunteer", volunteerSchema);
