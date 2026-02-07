const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  role: {
    type: String,
    enum: ["ngo", "volunteer", "admin"],
    required: true
  },

  volunteerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Volunteer",
    default: null
  },

  isBlocked: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("User", userSchema);
