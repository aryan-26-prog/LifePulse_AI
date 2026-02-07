const WorkReport = require("../models/VolunteerWorkReport");
const Volunteer = require("../models/Volunteer");
const { generateBadges } = require("../utils/badgeEngine");

// VOLUNTEER SUBMIT REPORT 
exports.submitWorkReport = async (req, res) => {

  try {

    const { description, peopleHelped, hoursWorked, campId } = req.body;

    if (!campId)
      return res.status(400).json({ message: "Camp ID required" });

    const report = await WorkReport.create({

      volunteer: req.params.volunteerId,
      camp: campId,
      description,
      peopleHelped,
      hoursWorked,

      images: req.files ? req.files.map(f => f.path) : []
    });

    res.json(report);

  } catch (err) {

    console.error("REPORT SUBMIT ERROR:", err.message);

    res.status(500).json({
      message: "Report submission failed"
    });
  }
};



/* ================= NGO APPROVE ================= */
exports.approveReport = async (req, res) => {

  try {

    const report = await WorkReport.findById(req.params.reportId)
      .populate("volunteer");

    if (!report)
      return res.status(404).json({ message: "Report not found" });

    if (!report.volunteer)
      return res.status(404).json({ message: "Volunteer not found" });

    if (report.status === "APPROVED")
      return res.json({ message: "Already approved" });

    const volunteer = report.volunteer;

    /* ⭐ SAFE DEFAULTS */
    if (!volunteer.completedCamps) volunteer.completedCamps = 0;
    if (!volunteer.badges) volunteer.badges = [];

    /* ⭐ UPDATE WORK COUNT */
    volunteer.completedCamps += 1;

    /* ⭐ GENERATE BADGES */
    const newBadges = generateBadges(volunteer.completedCamps);

    newBadges.forEach(b => {

      const exists = volunteer.badges.some(
        existing => existing.name === b.name
      );

      if (!exists) volunteer.badges.push(b);
    });

    report.status = "APPROVED";

    await volunteer.save();
    await report.save();

    res.json({
      message: "Report approved & badge granted",
      volunteer
    });

  } catch (err) {

    console.error("APPROVE REPORT ERROR:", err.message);

    res.status(500).json({
      message: "Approval failed"
    });
  }
};


// NGO REJECT 
exports.rejectReport = async (req, res) => {

  try {

    const report = await WorkReport.findById(req.params.reportId);

    report.status = "REJECTED";
    report.ngoFeedback = req.body.feedback;

    await report.save();

    res.json({ message: "Report rejected" });

  } catch (err) {
    res.status(500).json({ message: "Reject failed" });
  }
};

exports.getCampReports = async (req, res) => {

  const reports = await WorkReport.find({
    camp: req.params.campId
  })
    .populate("volunteer", "name")
    .sort({ createdAt: -1 });

  res.json({
    data: reports
  });
};

