const mongoose = require("mongoose");
const Volunteer = require("../models/Volunteer");
const ReliefCamp = require("../models/ReliefCamp");
const WorkReport = require("../models/VolunteerWorkReport");


/* ================= GET ACTIVE + PENDING CAMPS ================= */
exports.getActiveCamps = async (req, res) => {

  try {

    const volunteerId = req.query.volunteerId;

    const camps = await ReliefCamp.find({
      status: { $in: ["ACTIVE", "PENDING"] }
    }).populate("volunteerAssigned", "name phone");

    let filteredCamps = camps;

    // Remove camp if report already submitted
    if (volunteerId) {

      const reports = await WorkReport.find({
        volunteer: volunteerId
      });

      const reportedCampIds = reports.map(r => r.camp.toString());

      filteredCamps = camps.filter(
        c => !reportedCampIds.includes(c._id.toString())
      );
    }

    const formatted = filteredCamps.map(c => ({
      id: c._id,
      area: c.area,
      lat: c.lat,
      lng: c.lng,
      riskLevel: c.riskLevel,
      status: c.status,
      volunteersCount: c.volunteerAssigned?.length || 0,
      resources: c.resources
    }));

    res.json({
      message: "Relief camps fetched",
      data: formatted
    });

  } catch (err) {

    console.error("Active Camps Error:", err);

    res.status(500).json({
      message: "Failed to fetch camps"
    });

  }
};




/* ================= VOLUNTEER DASHBOARD ================= */
exports.getVolunteerDashboard = async (req, res) => {

  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid volunteer ID"
      });
    }

    const volunteer = await Volunteer
      .findById(id)
      .populate("assignedCamp");

    if (!volunteer) {
      return res.status(404).json({
        message: "Volunteer not found"
      });
    }

    let reportSubmitted = false;

    if (volunteer.assignedCamp) {

      const report = await WorkReport.findOne({
      volunteer: volunteer._id,
      camp: volunteer.assignedCamp._id,
      status: { $in: ["PENDING", "APPROVED"] }
    });


      reportSubmitted = !!report;
    }

    res.json({
      volunteer,
      assignedCamp: volunteer.assignedCamp || null,
      reportSubmitted
    });

  } catch (err) {

    console.error("Dashboard Error:", err);

    res.status(500).json({
      message: "Dashboard fetch failed"
    });
  }
};




/* ================= JOIN CAMP ================= */
exports.joinCamp = async (req, res) => {

  try {

    const { id } = req.params;
    const { campId } = req.body;

    // VALIDATION
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid volunteer ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(campId)) {
      return res.status(400).json({ message: "Invalid camp ID" });
    }

    const volunteer = await Volunteer.findById(id);
    const camp = await ReliefCamp.findById(campId);

    if (!volunteer || !camp) {
      return res.status(404).json({
        message: "Volunteer or Camp not found"
      });
    }

    if (!["ACTIVE", "PENDING"].includes(camp.status)) {
      return res.status(400).json({
        message: "Camp is closed"
      });
    }

    if (volunteer.assignedCamp) {
      return res.status(400).json({
        message: "Already assigned to a camp"
      });
    }

    volunteer.assignedCamp = campId;
    volunteer.available = false;

    // SAFE OBJECTID COMPARISON
    const alreadyAdded = camp.volunteerAssigned.some(
      v => v.toString() === volunteer._id.toString()
    );

    if (!alreadyAdded) {
      camp.volunteerAssigned.push(volunteer._id);
    }

    await volunteer.save();
    await camp.save();

    res.json({
      message: "Joined relief camp successfully"
    });

  } catch (err) {

    console.error("Join Camp Error:", err);

    res.status(500).json({
      message: "Join camp failed"
    });
  }
};



/* ================= LEAVE CAMP ================= */
exports.leaveCamp = async (req, res) => {

  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid volunteer ID"
      });
    }

    const volunteer = await Volunteer.findById(id);

    if (!volunteer) {
      return res.status(404).json({
        message: "Volunteer not found"
      });
    }

    if (volunteer.assignedCamp) {

      const camp = await ReliefCamp.findById(volunteer.assignedCamp);

      if (camp) {

        camp.volunteerAssigned =
          camp.volunteerAssigned.filter(
            v => v.toString() !== volunteer._id.toString()
          );

        await camp.save();
      }
    }

    volunteer.assignedCamp = null;
    volunteer.available = true;

    await volunteer.save();

    res.json({
      message: "Left relief camp"
    });

  } catch (err) {

    console.error("Leave Camp Error:", err);

    res.status(500).json({
      message: "Leave camp failed"
    });
  }
};



/* ================= GET REGISTERED VOLUNTEERS ================= */
exports.getRegisteredVolunteers = async (req, res) => {

  try {

    const volunteers = await Volunteer.find()
      .select("name phone available completedCamps badges");

    res.json({
      message: "Registered volunteers",
      data: volunteers
    });

  } catch (err) {

    console.error("Volunteers Fetch Error:", err);

    res.status(500).json({
      message: "Failed to fetch volunteers"
    });
  }
};



/* ================= VOLUNTEER PROFILE ================= */
exports.getVolunteerProfile = async (req, res) => {

  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid volunteer ID"
      });
    }

    const volunteer = await Volunteer.findById(id);

    if (!volunteer) {
      return res.status(404).json({
        message: "Volunteer not found"
      });
    }

    res.json(volunteer);

  } catch (err) {

    console.error("Profile Error:", err);

    res.status(500).json({
      message: "Profile fetch failed"
    });
  }
};

