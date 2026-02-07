const axios = require("axios");
const EnvLog = require("../models/EnvLog");

// ================= AQI CALC =================
function calculateAQI(pm25) {
  if (pm25 <= 30) return Math.round((pm25 / 30) * 50);
  if (pm25 <= 60) return Math.round(((pm25 - 31) / 29) * 50 + 51);
  if (pm25 <= 90) return Math.round(((pm25 - 61) / 29) * 100 + 101);
  if (pm25 <= 120) return Math.round(((pm25 - 91) / 29) * 100 + 201);
  if (pm25 <= 250) return Math.round(((pm25 - 121) / 129) * 100 + 301);
  return 500;
}

// ================= AQI META =================
function aqiMeta(aqi) {
  if (aqi <= 50) return { label: "Good 🟢" };
  if (aqi <= 100) return { label: "Moderate 🟡" };
  if (aqi <= 200) return { label: "Poor 🟠" };
  if (aqi <= 300) return { label: "Very Poor 🔴" };
  return { label: "Severe 🟣" };
}


// ⭐ NEW → AQI BASED RISK CLASSIFICATION
function classifyRisk(aqi) {

  if (aqi <= 50) return "LOW";
  if (aqi <= 200) return "MEDIUM";
  if (aqi <= 300) return "HIGH";
  return "SEVERE";
}


// ================= SMART SUGGESTION ENGINE =================
function generateSmartSuggestions({ aqi, pollutants, weather }) {

  const pm25 = pollutants.pm2_5 || 0;
  const suggestions = [];

  if (aqi > 300) {
    suggestions.push("🚨 Avoid outdoor exposure completely");
    suggestions.push("😷 Use N95 mask if stepping outside");
  } 
  else if (aqi > 150) {
    suggestions.push("⚠️ Reduce outdoor physical activity");
    suggestions.push("😷 Wear protective mask outdoors");
  }

  if (pm25 > 120) {
    suggestions.push("🫁 High respiratory risk detected");
  }

  if (weather.temp > 38) {
    suggestions.push("🌡️ Extreme heat — Stay hydrated & avoid sunlight");
  }

  if (weather.humidity > 80) {
    suggestions.push("💧 High humidity — Respiratory discomfort possible");
  }

  if (weather.windSpeed < 1) {
    suggestions.push("🌫️ Low wind — Pollution may accumulate");
  }

  if (!suggestions.length) {
    suggestions.push("✅ Air conditions safe for outdoor activities");
  }

  return suggestions;
}


// ================= HEALTH IMPACT =================
function calculateHealthImpact(aqi, pollutants, weather) {

  const pm25 = pollutants.pm2_5 || 0;

  let score =
    (aqi / 500) * 60 +
    (pm25 / 250) * 40;

  score = Math.min(100, Math.round(score));

  let status =
    score < 30 ? "Low Risk 🟢" :
    score < 60 ? "Moderate Risk 🟡" :
    score < 80 ? "High Risk 🟠" :
    "Critical Risk 🔴";

  const suggestions = generateSmartSuggestions({
    aqi,
    pollutants,
    weather
  });

  return { score, status, suggestions };
}


// ================= BY AREA =================
exports.getEnvironmentByArea = async (req, res) => {
  try {

    const area = req.query.area.toLowerCase();
    const key = process.env.OPENWEATHER_API_KEY;

    const geo = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${area}&limit=1&appid=${key}`
    );

    if (!geo.data.length)
      return res.status(404).json({ message: "Area not found" });

    const { lat, lon } = geo.data[0];

    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`
    );

    const airRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`
    );

    const weather = {
      temp: weatherRes.data.main.temp,
      humidity: weatherRes.data.main.humidity,
      windSpeed: weatherRes.data.wind.speed,
      condition: weatherRes.data.weather[0].description
    };

    const pollutants = airRes.data.list[0].components;

    const aqi = calculateAQI(pollutants.pm2_5);
    const meta = aqiMeta(aqi);
    const health = calculateHealthImpact(aqi, pollutants, weather);

    // ⭐ NEW RISK OUTPUT
    const risk = classifyRisk(aqi);

    await EnvLog.create({ area, aqi, pollutants });

    res.json({
      weather,
      aqi: {
        index: aqi,
        label: meta.label,
        pollutants
      },
      risk,          // ⭐ NEW FIELD
      health
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Environment fetch failed" });
  }
};


// ================= BY COORDS =================
exports.getEnvironmentByCoords = async (req, res) => {
  try {

    const { lat, lng } = req.query;

    if (!lat || !lng)
      return res.status(400).json({ message: "Coordinates missing" });

    const key = process.env.OPENWEATHER_API_KEY;

    const geo = await axios.get(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${key}`
    );

    if (!geo.data.length)
      return res.status(404).json({ message: "Location not found" });

    const area = geo.data[0].name.toLowerCase();

    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${key}`
    );

    const airRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${key}`
    );

    const weather = {
      temp: weatherRes.data.main.temp,
      humidity: weatherRes.data.main.humidity,
      windSpeed: weatherRes.data.wind.speed,
      condition: weatherRes.data.weather[0].description
    };

    const pollutants = airRes.data.list[0].components;

    const aqi = calculateAQI(pollutants.pm2_5);
    const meta = aqiMeta(aqi);
    const health = calculateHealthImpact(aqi, pollutants, weather);

    const risk = classifyRisk(aqi);

    res.json({
      area,
      weather,
      aqi: {
        index: aqi,
        label: meta.label,
        pollutants
      },
      risk,
      health
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Coords environment fetch failed" });
  }
};


// ================= HISTORY =================
exports.getAQIHistory = async (req, res) => {

  const area = req.query.area.toLowerCase();

  const data = await EnvLog
    .find({ area })
    .sort({ timestamp: -1 })
    .limit(24);

  res.json(data.reverse());
};