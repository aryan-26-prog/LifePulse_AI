const Volunteer = require("../models/Volunteer");
const ReliefCamp = require("../models/ReliefCamp");


/* ================= GET ACTIVE + PENDING CAMPS ================= */
exports.getActiveCamps = async (req, res) => {

  try {

    const camps = await ReliefCamp.find({
      status: { $in: ["ACTIVE", "PENDING"] }
    }).populate("volunteerAssigned", "name phone");

    const formatted = camps.map(c => ({
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
    res.status(500).json({
      message: "Failed to fetch camps"
    });
  }
};



/* ================= VOLUNTEER DASHBOARD ================= */
exports.getVolunteerDashboard = async (req, res) => {

  try {

    const volunteer = await Volunteer.findById(req.params.id)
      .populate("assignedCamp");

    if (!volunteer)
      return res.status(404).json({ message: "Volunteer not found" });

    res.json({
      volunteer,
      assignedCamp: volunteer.assignedCamp || null
    });

  } catch (err) {
    res.status(500).json({
      message: "Dashboard fetch failed"
    });
  }
};



/* ================= JOIN CAMP (ACTIVE + PENDING ALLOWED) ================= */
exports.joinCamp = async (req, res) => {

  try {

    const { campId } = req.body;

    if (!campId)
      return res.status(400).json({ message: "Camp ID required" });

    const volunteer = await Volunteer.findById(req.params.id);
    const camp = await ReliefCamp.findById(campId);

    if (!volunteer || !camp)
      return res.status(404).json({
        message: "Volunteer or Camp not found"
      });

    // ⭐ Allow ACTIVE + PENDING join
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

    if (!camp.volunteerAssigned.includes(volunteer._id)) {
      camp.volunteerAssigned.push(volunteer._id);
    }

    await volunteer.save();
    await camp.save();

    res.json({
      message: "Joined relief camp successfully"
    });

  } catch (err) {
    res.status(500).json({
      message: "Join camp failed"
    });
  }
};



/* ================= LEAVE CAMP ================= */
exports.leaveCamp = async (req, res) => {

  try {

    const volunteer = await Volunteer.findById(req.params.id);

    if (!volunteer)
      return res.status(404).json({ message: "Volunteer not found" });

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
    res.status(500).json({
      message: "Leave camp failed"
    });
  }
};


exports.getRegisteredVolunteers = async (req, res) => {
  try {

    const volunteers = await Volunteer.find()
      .select("name phone available completedCamps badges");

    res.json({
      message: "Registered volunteers",
      data: volunteers
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch volunteers"
    });
  }
};


exports.getVolunteerProfile = async (req, res) => {

  const volunteer = await Volunteer.findById(req.params.id);

  res.json(volunteer);
};
