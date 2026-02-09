const axios = require("axios");
const EnvLog = require("../models/EnvLog");

//  AQI CALC 
function subIndex(C, BP_lo, BP_hi, I_lo, I_hi) {
  return ((I_hi - I_lo) / (BP_hi - BP_lo)) * (C - BP_lo) + I_lo;
}

/* ================= PM2.5 ================= */
function pm25AQI(pm) {
  if (pm <= 30) return subIndex(pm, 0, 30, 0, 50);
  if (pm <= 60) return subIndex(pm, 31, 60, 51, 100);
  if (pm <= 90) return subIndex(pm, 61, 90, 101, 200);
  if (pm <= 120) return subIndex(pm, 91, 120, 201, 300);
  if (pm <= 250) return subIndex(pm, 121, 250, 301, 400);
  return subIndex(pm, 251, 500, 401, 500);
}

/* ================= PM10 ================= */
function pm10AQI(pm) {
  if (pm <= 50) return subIndex(pm, 0, 50, 0, 50);
  if (pm <= 100) return subIndex(pm, 51, 100, 51, 100);
  if (pm <= 250) return subIndex(pm, 101, 250, 101, 200);
  if (pm <= 350) return subIndex(pm, 251, 350, 201, 300);
  if (pm <= 430) return subIndex(pm, 351, 430, 301, 400);
  return subIndex(pm, 431, 600, 401, 500);
}

/* ================= CO ================= */
function coAQI(co) {
  co = co / 1000; // µg → mg
  if (co <= 1) return subIndex(co, 0, 1, 0, 50);
  if (co <= 2) return subIndex(co, 1.1, 2, 51, 100);
  if (co <= 10) return subIndex(co, 2.1, 10, 101, 200);
  if (co <= 17) return subIndex(co, 10.1, 17, 201, 300);
  if (co <= 34) return subIndex(co, 17.1, 34, 301, 400);
  return subIndex(co, 34.1, 50, 401, 500);
}

/* ================= FINAL AQI ================= */
function calculateAQI(pollutants, history = []) {

  const pm25 = pm25AQI(pollutants.pm2_5 || 0);
  const pm10 = pm10AQI(pollutants.pm10 || 0);

  // CO ko clearly secondary rakho
  let co = coAQI(pollutants.co || 0) * 0.5;

  // STEP 1: scientific dominant AQI
  let instantAQI = Math.max(pm25, pm10, co);

  // STEP 2: rolling average (MOST IMPORTANT)
  let smoothedAQI = instantAQI;

  if (history.length > 0) {
    const avgHistory =
      history.reduce((a, b) => a + b, 0) / history.length;

    // 🔑 heavy smoothing
    smoothedAQI =
      (avgHistory * 0.6) +
      (instantAQI * 0.4);
  }

  // STEP 3: realistic ceiling
  if (smoothedAQI > 350) smoothedAQI = 350;
  if (smoothedAQI < 25) smoothedAQI = 25;

  return Math.round(smoothedAQI);
}



// AQI META 
function aqiMeta(aqi) {
  if (aqi <= 50) return { label: "Good 🟢" };
  if (aqi <= 100) return { label: "Moderate 🟡" };
  if (aqi <= 200) return { label: "Poor 🟠" };
  if (aqi <= 300) return { label: "Very Poor 🔴" };
  return { label: "Severe 🟣" };
}


// AQI BASED RISK CLASSIFICATION
function classifyRisk(aqi) {

  if (aqi <= 50) return "LOW";
  if (aqi <= 200) return "MEDIUM";
  if (aqi <= 300) return "HIGH";
  return "SEVERE";
}


// SMART SUGGESTION ENGINE 
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


// HEALTH IMPACT 
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


// BY AREA 
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

    const aqi = calculateAQI(pollutants);
    const meta = aqiMeta(aqi);
    const health = calculateHealthImpact(aqi, pollutants, weather);

    //  NEW RISK OUTPUT
    const risk = classifyRisk(aqi);

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

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Environment fetch failed" });
  }
};


// location BY COORDS 
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

    const aqi = calculateAQI(pollutants);
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


// HISTORY 
exports.getAQIHistory = async (req, res) => {

  const area = req.query.area.toLowerCase();

  const data = await EnvLog
    .find({ area })
    .sort({ timestamp: -1 })
    .limit(24);

  res.json(data.reverse());
};