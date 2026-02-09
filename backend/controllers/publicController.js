const axios = require("axios");

// Google AQI (PM2.5 based – standard)
function subIndex(C, BP_lo, BP_hi, I_lo, I_hi) {
  return ((I_hi - I_lo) / (BP_hi - BP_lo)) * (C - BP_lo) + I_lo;
}

function calcPM25(pm) {
  if (pm <= 30) return subIndex(pm, 0, 30, 0, 50);
  if (pm <= 60) return subIndex(pm, 31, 60, 51, 100);
  if (pm <= 90) return subIndex(pm, 61, 90, 101, 200);
  if (pm <= 120) return subIndex(pm, 91, 120, 201, 300);
  if (pm <= 250) return subIndex(pm, 121, 250, 301, 400);
  return subIndex(pm, 251, 500, 401, 500);
}

function calcPM10(pm) {
  if (pm <= 50) return subIndex(pm, 0, 50, 0, 50);
  if (pm <= 100) return subIndex(pm, 51, 100, 51, 100);
  if (pm <= 250) return subIndex(pm, 101, 250, 101, 200);
  if (pm <= 350) return subIndex(pm, 251, 350, 201, 300);
  if (pm <= 430) return subIndex(pm, 351, 430, 301, 400);
  return subIndex(pm, 431, 600, 401, 500);
}

function calcCO(co) {
  co = co / 1000; // µg → mg
  if (co <= 1) return subIndex(co, 0, 1, 0, 50);
  if (co <= 2) return subIndex(co, 1.1, 2, 51, 100);
  if (co <= 10) return subIndex(co, 2.1, 10, 101, 200);
  if (co <= 17) return subIndex(co, 10.1, 17, 201, 300);
  if (co <= 34) return subIndex(co, 17.1, 34, 301, 400);
  return subIndex(co, 34.1, 50, 401, 500);
}

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



function aqiMeta(aqi) {
  if (aqi <= 50) return ["Good 🟢", "Air is clean"];
  if (aqi <= 100) return ["Moderate 🟡", "Sensitive people be cautious"];
  if (aqi <= 200) return ["Poor 🟠", "Limit outdoor exposure"];
  if (aqi <= 300) return ["Very Poor 🔴", "Avoid outdoor activity"];
  return ["Severe 🟣", "Stay indoors. Serious risk"];
}

exports.getEnvironmentData = async (req, res) => {
  try {
    const { area } = req.query;
    const key = process.env.OPENWEATHER_API_KEY;

    // 1️⃣ Area → lat/lng
    const geo = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${area}&limit=1&appid=${key}`
    );

    if (!geo.data.length) {
      return res.status(404).json({ message: "Area not found" });
    }

    const { lat, lon } = geo.data[0];

    // 2️⃣ Weather
    const weather = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`
    );

    // 3️⃣ Air Pollution
    const air = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`
    );

    const pollutants = air.data.list[0].components;
    const aqi = calculateAQI(pollutants);
    const [label, advice] = aqiMeta(aqi);

    res.json({
      weather: {
        temp: weather.data.main.temp,
        humidity: weather.data.main.humidity,
        windSpeed: weather.data.wind.speed,
        condition: weather.data.weather[0].description
      },
      aqi: {
        index: aqi,          // 0–500 REAL AQI
        label,
        advice,
        pollutants
      }
    });

  } catch (err) {
    console.error("ENV ERROR:", err.message);
    res.status(500).json({ message: "Environment fetch failed" });
  }
};

