const WorkReport = require("../models/VolunteerWorkReport");
const Volunteer = require("../models/Volunteer");
const { generateBadges } = require("../utils/badgeEngine");
const { calculateXP, calculateLevel } = require("../utils/xpEngine");
const uploadToCloudinary = require("../utils/cloudinaryUpload");


/* ================= VOLUNTEER SUBMIT REPORT ================= */
exports.submitWorkReport = async (req, res) => {

  try {

    const volunteerId = req.params.volunteerId;
    const { description, peopleHelped, hoursWorked, campId } = req.body;

    if (!volunteerId)
      return res.status(400).json({ message: "Volunteer ID missing" });

    if (!campId)
      return res.status(400).json({ message: "Camp ID required" });

    let images = [];

    if (req.files && req.files.length > 0) {

      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        images.push(url);
      }

    }

    const report = await WorkReport.create({
      volunteer: volunteerId,
      camp: campId,
      description,
      peopleHelped: Number(peopleHelped || 0),
      hoursWorked: Number(hoursWorked || 0),
      images
    });

    const io = req.app.get("io");

    if (io) {
      io.to("ngoRoom").emit("newWorkReport", {
        campId,
        report
      });
    }

    res.json(report);

  } catch (err) {

    console.error("REPORT SUBMIT ERROR:", err);

    res.status(500).json({
      message: "Report submission failed",
      error: err.message
    });
  }
};


/* ================= NGO APPROVE ================= */
exports.approveReport = async (req, res) => {

  try {

    const report = await WorkReport.findById(req.params.reportId)
      .populate("volunteer")
      .populate("camp");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.status === "APPROVED") {
      return res.json({ message: "Already approved" });
    }

    report.status = "APPROVED";

    const volunteer = report.volunteer;

    /* ================= CAMP COMPLETION ================= */
    volunteer.completedCamps = (volunteer.completedCamps || 0) + 1;

    /* ================= IMPACT STATS ================= */
    volunteer.totalPeopleHelped =
      (volunteer.totalPeopleHelped || 0) + (report.peopleHelped || 0);

    volunteer.totalHours =
      (volunteer.totalHours || 0) + (report.hoursWorked || 0);

    /* ================= XP CALC ================= */
    const xpEarned = calculateXP({
      hoursWorked: report.hoursWorked || 0,
      peopleHelped: report.peopleHelped || 0,
      imagesCount: report.images?.length || 0
    });

    volunteer.xp = (volunteer.xp || 0) + xpEarned;

    /* ================= LEVEL ================= */
    volunteer.level = calculateLevel(volunteer.xp);

    /* ================= BADGES ================= */
    const newBadges = generateBadges(volunteer.completedCamps);

    newBadges.forEach(b => {

      const exists = volunteer.badges?.some(
        existing => existing.name === b.name
      );

      if (!exists) {
        volunteer.badges.push(b);
      }
    });

    await volunteer.save();
    await report.save();

    /* ================= SOCKET REALTIME ================= */
    const io = req.app.get("io");

    if (io) {

      io.to(volunteer._id.toString()).emit("reportApproved", {
        reportId: report._id,
        xpEarned,
        level: volunteer.level
      });

    }

    res.json({
      message: "Report approved",
      xpEarned
    });

  } catch (err) {

    console.error("APPROVE REPORT ERROR:", err);

    res.status(500).json({
      message: "Approval failed",
      error: err.message
    });
  }
};

/* ================= NGO REJECT ================= */
exports.rejectReport = async (req, res) => {

  try {

    const io = req.app.get("io"); // ⭐ FIXED

    const report = await WorkReport.findById(req.params.reportId)
      .populate("volunteer");

    report.status = "REJECTED";
    report.ngoFeedback = req.body.feedback;

    await report.save();

    /* ⭐ REALTIME VOLUNTEER UPDATE */
    if (io) {
      io.to(report.volunteer._id.toString()).emit("reportRejected", {
        feedback: report.ngoFeedback
      });
    }

    res.json({ message: "Report rejected" });

  } catch (err) {
    res.status(500).json({ message: "Reject failed" });
  }
};




/* ================= GET CAMP REPORTS ================= */
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
