const mongoose = require("mongoose");

const workReportSchema = new mongoose.Schema({

  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Volunteer"
  },

  camp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ReliefCamp"
  },

  description: String,

  images: [String],

  peopleHelped: Number,
  hoursWorked: Number,

  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
  },

  ngoFeedback: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("WorkReport", workReportSchema);
