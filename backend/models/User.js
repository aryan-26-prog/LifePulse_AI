const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  /* ================= BASIC INFO ================= */
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  /* ================= ROLE ================= */
  role: {
    type: String,
    enum: ["ngo", "volunteer", "admin"],
    required: true
  },

  /* ================= NGO REGISTRATION ID ================= */
  ngoRegistrationId: {
    type: String,
    required: function () {
      return this.role === "ngo";   // ⭐ Only NGO required
    },
    default: null
  },

  /* ================= VOLUNTEER PROFILE LINK ================= */
  volunteerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Volunteer",
    default: null
  },

  /* ================= OTP AUTH (ALL ROLES) ================= */
  otp: {
    code: {
      type: String,
      default: null
    },

    expiresAt: {
      type: Date,
      default: null
    }
  },

  isEmailVerified: {
    type: Boolean,
    default: false
  },

  /* ================= ADMIN NGO APPROVAL (OPTIONAL FUTURE) ================= */
  isApprovedByAdmin: {
    type: Boolean,
    default: function () {
      return this.role !== "ngo"; // NGO needs approval
    }
  },

  /* ================= ACCOUNT CONTROL ================= */
  isBlocked: {
    type: Boolean,
    default: false
  },

  otpAttempts: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
