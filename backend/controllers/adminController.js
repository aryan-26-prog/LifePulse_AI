const HealthCheck = require("../models/HealthCheck");
const User = require("../models/User");
const { Parser } = require("json2csv");
const sendToAI = require("../utils/sendToAI");

// Admin Dashboard Summary
exports.getAdminDashboard = async (req, res) => {
  const totalReports = await HealthCheck.countDocuments();
  const totalNGOs = await User.countDocuments({ role: "ngo" });

  res.json({
    message: "Admin dashboard data",
    stats: {
      totalHealthReports: totalReports,
      totalNGOs
    }
  });
};

exports.getAllReports = async (req, res) => {
  try {

    const reports = await HealthCheck.find()
      .sort({ createdAt: -1 });

    res.json({ data: reports });

  } catch (err) {
    console.error("Fetch reports error:", err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};


// Delete a health report
exports.deleteHealthReport = async (req, res) => {
  const { id } = req.params;

  const report = await HealthCheck.findById(id);
  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  await report.deleteOne();

  res.json({ message: "Health report deleted successfully" });
};


exports.getAllNGOs = async (req, res) => {
  try {

    const ngos = await User.find({ role: "ngo" })
      .select("name email isBlocked createdAt");

    res.json({ data: ngos });

  } catch (err) {
    console.error("Fetch NGOs error:", err);
    res.status(500).json({ message: "Failed to fetch NGOs" });
  }
};


// Block / Unblock NGO
exports.blockNGO = async (req, res) => {
  const { id } = req.params;

  const ngo = await User.findById(id);
  if (!ngo || ngo.role !== "ngo") {
    return res.status(404).json({ message: "NGO not found" });
  }

  ngo.isBlocked = !ngo.isBlocked;
  await ngo.save();

  res.json({
    message: ngo.isBlocked ? "NGO blocked" : "NGO unblocked",
    ngoId: ngo._id,
    status: ngo.isBlocked
  });
};


// Area-wise health stats
exports.getFullAreaStats = async (req, res) => {
  const stats = await HealthCheck.aggregate([
    {
      $group: {
        _id: "$location.area",
        totalReports: { $sum: 1 },
        avgSleep: { $avg: "$sleep" },
        avgStress: { $avg: "$stress" },
        allSymptoms: { $push: "$symptoms" }
      }
    },
    {
      $project: {
        area: "$_id",
        totalReports: 1,
        avgSleep: { $round: ["$avgSleep", 1] },
        avgStress: { $round: ["$avgStress", 1] },
        commonSymptoms: {
          $slice: [
            {
              $setUnion: {
                $reduce: {
                  input: "$allSymptoms",
                  initialValue: [],
                  in: { $concatArrays: ["$$value", "$$this"] }
                }
              }
            },
            5
          ]
        }
      }
    }
  ]);

  res.json({
    message: "Full area-wise statistics",
    data: stats
  });
};


exports.HealthCSV = async (req, res) => {
  const reports = await HealthCheck.find().lean();

  const formatted = reports.map(r => ({
    sleep: r.sleep,
    stress: r.stress,
    symptoms: r.symptoms?.join(" | "),
    area: r.location?.area,
    lat: r.location?.lat,
    lng: r.location?.lng,
    createdAt: r.createdAt
  }));

  const fields = [
    "sleep",
    "stress",
    "symptoms",
    "area",
    "lat",
    "lng",
    "createdAt"
  ];

  const parser = new Parser({ fields });
  const csv = parser.parse(formatted);

  res.header("Content-Type", "text/csv");
  res.attachment("health_reports.csv");
  res.send(csv);
};


// used to get risk per area
exports.getAIRiskPerArea = async (req, res) => {
  const areas = await HealthCheck.aggregate([
    {
      $group: {
        _id: "$location.area",
        avgSleep: { $avg: "$sleep" },
        avgStress: { $avg: "$stress" },
        symptoms: { $push: "$symptoms" }
      }
    }
  ]);

  const aiResults = [];

  for (let area of areas) {
    const aiResponse = await sendToAI([
      {
        sleep: area.avgSleep,
        stress: area.avgStress,
        symptoms: area.symptoms.flat()
      }
    ]);

    aiResults.push({
      area: area._id,
      risk: aiResponse.predictions[0].risk
    });
  }

  res.json({
    message: "AI risk per area",
    data: aiResults
  });
};

//used to get full analytics dashboard
exports.getReportAnalytics = async (req, res) => {
  try {

    const reportsPerArea = await HealthCheck.aggregate([
      {
        $group: {
          _id: "$locattion.area",
          count: { $sum: 1}
        }
      }
    ]);

    //avg stress-sleep
    const stressSleep = await HealthCheck.aggregate([
      {
        $group: {
          _id: null,
          avgStress: { $avg: "$stress"},
          avgSleep: { $avg: "$sleep"}
        }
      }
    ]);
    
    //for ymptoms frequency
    const symptoms = await HealthCheck.aggregate([
      { $unwind: "$symptoms"},
      {
        $group: {
          _id: "$symptoms",
          count: { $sum: 1}
        }
      },
      { $sort: { count: -1} },
      { $limit: 5 } 
    ]);

    res.json({
      reportsPerArea,
      stressSleep: stressSleep[0] || {},
      symptoms
    });

  } catch (err) {
    res.stats(500).json({message: "Analytics fetch failed"});
  }
};