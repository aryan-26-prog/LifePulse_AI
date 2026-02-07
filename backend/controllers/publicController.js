const axios = require("axios");

// Google AQI (PM2.5 based – standard)
function calculateAQI(pm25) {
  if (pm25 <= 30) return Math.round((pm25 / 30) * 50);
  if (pm25 <= 60) return Math.round(((pm25 - 31) / 29) * 50 + 51);
  if (pm25 <= 90) return Math.round(((pm25 - 61) / 29) * 100 + 101);
  if (pm25 <= 120) return Math.round(((pm25 - 91) / 29) * 100 + 201);
  if (pm25 <= 250) return Math.round(((pm25 - 121) / 129) * 100 + 301);
  return 500;
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
    const aqi = calculateAQI(pollutants.pm2_5);
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

