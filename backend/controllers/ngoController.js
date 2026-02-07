const ReliefCamp = require("../models/ReliefCamp");
const Volunteer = require("../models/Volunteer");
const { generateBadges } = require("../utils/badgeEngine");

/* ================= DEPLOY RELIEF CAMP ================= */
exports.deployRelief = async (req, res) => {

  try {

    const { area, lat, lng, riskLevel } = req.body;

    if (!area || lat === undefined || lng === undefined || !riskLevel) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const risk = riskLevel.toUpperCase();

    if (!["LOW", "MEDIUM", "HIGH", "SEVERE"].includes(risk)) {
      return res.status(400).json({ message: "Invalid risk level" });
    }

    /* ===== AUTO RESOURCE ALLOCATION ===== */
    let resources = {
      masks: 300,
      medicines: 150,
      oxygen: 50
    };

    if (risk === "HIGH") {
      resources = {
        masks: 1000,
        medicines: 500,
        oxygen: 200
      };
    }

    if (risk === "SEVERE") {
      resources = {
        masks: 2000,
        medicines: 900,
        oxygen: 500
      };
    }

    /* ⭐ DIRECT ACTIVE CAMP */
    const camp = await ReliefCamp.create({
      area,
      lat,
      lng,
      riskLevel: risk,
      resources,
      status: "ACTIVE"   // ⭐ MAIN FIX
    });

    res.json({
      message: "Relief Camp Deployed & Activated",
      camp
    });

  } catch (err) {

    console.error("DEPLOY RELIEF ERROR:", err);

    res.status(500).json({
      message: "Relief Camp Deploy Failed"
    });
  }
};



/* ================= ASSIGN VOLUNTEERS ================= */
exports.assignVolunteers = async (req, res) => {

  try {

    const { campId, volunteerIds } = req.body;

    const camp = await ReliefCamp.findById(campId);

    if (!camp)
      return res.status(404).json({ message: "Camp not found" });

    // Only available volunteers
    const volunteers = await Volunteer.find({
      _id: { $in: volunteerIds },
      available: true
    });

    const ids = volunteers.map(v => v._id);

    camp.volunteerAssigned = ids;
    camp.status = "ACTIVE";

    await camp.save();

    await Volunteer.updateMany(
      { _id: { $in: ids } },
      { available: false, assignedCamp: campId }
    );

    res.json({
      message: "Volunteers assigned successfully",
      count: ids.length
    });

  } catch (err) {
    res.status(500).json({
      message: "Assignment failed"
    });
  }
};

/* ================= GET CAMP BY ID ================= */
exports.getCampById = async (req, res) => {

  try {

    const camp = await ReliefCamp.findById(req.params.campId)
      .populate("volunteerAssigned", "name phone");

    if (!camp)
      return res.status(404).json({ message: "Camp not found" });

    res.json(camp);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch camp" });
  }
};



/* ================= CLOSE CAMP ================= */
exports.closeCamp = async (req, res) => {

  const { campId } = req.body;

  const camp = await ReliefCamp.findById(campId);

  if (!camp) return res.status(404).json({ message: "Camp not found" });

  // ⭐ Update Volunteers Work
  const volunteers = await Volunteer.find({
    _id: { $in: camp.volunteerAssigned }
  });

  for (let v of volunteers) {

    v.completedCamps += 1;

    const newBadges = generateBadges(v.completedCamps);

    // Prevent duplicate badges
    newBadges.forEach(b => {
      if (!v.badges.some(existing => existing.name === b.name)) {
        v.badges.push(b);
      }
    });

    v.available = true;
    v.assignedCamp = null;

    await v.save();
  }

  camp.status = "CLOSED";
  camp.volunteerAssigned = [];

  await camp.save();

  res.json({
    message: "Camp closed and volunteers rewarded"
  });
};



/* ================= GET ALL CAMPS ================= */
exports.getAllCamps = async (req, res) => {

  try {

    const camps = await ReliefCamp.find()
      .sort({ createdAt: -1 });

    res.json(camps);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch camps" });
  }
};
