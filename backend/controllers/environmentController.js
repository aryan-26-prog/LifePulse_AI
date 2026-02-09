const axios = require("axios");
const EnvLog = require("../models/EnvLog");


// ================= OPENWEATHER AQI → REALISTIC RANGE =================
function mapOpenWeatherAQI(owAQI, pollutants) {

  let pm25 = pollutants.pm2_5 || 0;

  // ⭐ normalize PM spike
  pm25 = Math.min(pm25, 200);

  let value = 100;

  switch (owAQI) {

    case 1:
      value = 30 + pm25 * 0.2;
      break;

    case 2:
      value = 60 + pm25 * 0.3;
      break;

    case 3:
      value = 110 + pm25 * 0.4;
      break;

    case 4:
      value = 170 + pm25 * 0.5;
      break;

    case 5:
      value = 230 + pm25 * 0.6;
      break;
  }

  return Math.min(450, Math.round(value));
}




// ================= AQI META =================
function aqiMeta(aqi) {

  if (aqi <= 50) return { label: "Good 🟢" };
  if (aqi <= 100) return { label: "Moderate 🟡" };
  if (aqi <= 200) return { label: "Poor 🟠" };
  if (aqi <= 300) return { label: "Very Poor 🔴" };
  return { label: "Severe 🟣" };
}


// ================= RISK CLASSIFICATION =================
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
    score < 80 ? "High Risk 🔴" :
    "Critical Risk 🟣";

  const suggestions = generateSmartSuggestions({
    aqi,
    pollutants,
    weather
  });

  return { score, status, suggestions };
}



// ================= GET ENVIRONMENT BY AREA =================
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

    // ✅ FIXED AQI
    const owAQI = airRes.data.list[0].main.aqi;
    const aqi = mapOpenWeatherAQI(
      owAQI,
      pollutants
    );


    const meta = aqiMeta(aqi);
    const health = calculateHealthImpact(aqi, pollutants, weather);
    const risk = classifyRisk(aqi);

    // ✅ Store history
    await EnvLog.create({ area, aqi, pollutants });

    res.json({
      weather,
      aqi: {
        index: aqi,
        label: meta.label,
        pollutants
      },
      risk,
      health
    });

  }
  catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Environment fetch failed" });
  }
};



// ================= GET ENVIRONMENT BY COORDS =================
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

    // ✅ FIXED AQI
    const owAQI = airRes.data.list[0].main.aqi;
    const aqi = mapOpenWeatherAQI(
      owAQI,
      pollutants
    );


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

  }
  catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Coords environment fetch failed" });
  }
};



// ================= AQI HISTORY =================
exports.getAQIHistory = async (req, res) => {

  const area = req.query.area.toLowerCase();

  const data = await EnvLog
    .find({ area })
    .sort({ timestamp: -1 })
    .limit(24);

  res.json(data.reverse());
};
