const axios = require("axios");
const HealthCheck = require("../models/HealthCheck");
const sendToAI = require("../utils/sendToAI");

const getAIRiskPerArea = async (req, res) => {
  try {

    // ================= SAFE AGGREGATION =================
    const areas = await HealthCheck.aggregate([
      {
        $match: {
          "location.area": { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: "$location.area",
          avgStress: { $avg: "$stress" },
          avgSleep: { $avg: "$sleep" },
          symptoms: { $push: "$symptoms" }
        }
      }
    ]);

    const results = [];

    // ================= LOOP AREAS =================
    for (const areaData of areas) {

      try {

        // ================= FETCH ENVIRONMENT =================
        const envRes = await axios.get(
          `http://localhost:5000/api/public/environment/area?area=${areaData._id}`
        );

        const env = envRes.data;

        const realAQI = env?.aqi?.index || 0;

        // ================= BUILD SAFE AI PAYLOAD =================
        const healthPayload = {
          sleep: Number(Math.round(areaData.avgSleep || 7)),
          stress: Number(Math.round(areaData.avgStress || 5)),
          symptoms: (areaData.symptoms || []).flat()
        };

        const envPayload = {
          aqi: Number(realAQI),
          temperature: Number(env?.weather?.temp || 25),
          humidity: Number(env?.weather?.humidity || 50),
          windSpeed: Number(env?.weather?.windSpeed || 3)
        };

        // ================= CALL AI =================
        const aiResponse = await sendToAI(
          healthPayload,
          envPayload
        );

        const aiData = aiResponse?.predictions?.[0]?.risk || {
          risk: "UNKNOWN",
          envScore: 0,
          humanScore: 0,
          confidence: 0
        };

        // ================= GEO LOOKUP =================
        let lat = null;
        let lng = null;

        try {
          const geo = await axios.get(
            `https://api.openweathermap.org/geo/1.0/direct?q=${areaData._id}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`
          );

          if (geo.data?.length) {
            lat = geo.data[0].lat;
            lng = geo.data[0].lon;
          }

        } catch (geoErr) {
          console.log("Geo lookup failed:", areaData._id);
        }

        // ================= FINAL RESPONSE =================
        results.push({
          area: areaData._id,

          //  REAL AQI
          avgAQI: realAQI,

          //  AI RISK
          risk: aiData.risk,
          envScore: aiData.envScore,
          humanScore: aiData.humanScore,
          confidence: aiData.confidence,

          avgStress: healthPayload.stress,
          avgSleep: healthPayload.sleep,

          lat,
          lng
        });

      } catch (err) {
        console.log("Skipping area:", areaData._id, err.message);
      }
    }

    res.json({ data: results });

  } catch (err) {
    console.error("AI RISK ERROR:", err.message);
    res.status(500).json({ message: "AI risk calculation failed" });
  }
};

module.exports = {
  getAIRiskPerArea
};
