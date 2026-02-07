const HealthCheck = require("../models/HealthCheck");

exports.submitHealth = async (req, res) => {
  const data = await HealthCheck.create({
    sleep: req.body.sleep,
    stress: req.body.stress,
    symptoms: req.body.symptoms,
    location: {
      lat: req.body.location.lat,
      lng: req.body.location.lng,
      area: req.body.location.area
    }
  });

  res.status(201).json({
    message: "Health data submitted",
    data
  });
};

