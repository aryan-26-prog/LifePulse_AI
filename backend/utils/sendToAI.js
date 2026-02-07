const axios = require("axios");

module.exports = async (
  healthData = {},
  environmentData = {},
  history = []
) => {

  try {

    // SAFE HEALTH DATA 
    const safeHealth = {
      sleep: Number(healthData?.sleep ?? 7),
      stress: Number(healthData?.stress ?? 5),
      symptoms: Array.isArray(healthData?.symptoms)
        ? healthData.symptoms
        : []
    };

    // SAFE ENV DATA 
    const safeEnv = {
      aqi: Number(environmentData?.aqi ?? 0),
      temperature: Number(environmentData?.temperature ?? 25),
      humidity: Number(environmentData?.humidity ?? 50),
      windSpeed: Number(environmentData?.windSpeed ?? 3)
    };

    // BUILD PAYLOAD 
    const payload = {
      health_data: [safeHealth],
      environment: safeEnv,
      history: Array.isArray(history)
        ? history.map(Number)
        : []
    };

    // CALL AI ENGINE 
    const response = await axios.post(
      process.env.AI_ENGINE_URL,
      payload
    );

    // SAFE RESPONSE RETURN 
    if (!response?.data?.predictions?.length) {
      throw new Error("Invalid AI response");
    }

    return response.data;

  } catch (err) {

    console.error(
      "AI ENGINE ERROR:",
      err.response?.data || err.message
    );

    // SAFE FALLBACK RESPONSE 
    return {
      predictions: [
        {
          risk: "UNKNOWN",
          finalAQI: Number(environmentData?.aqi ?? 0),
          envScore: 0,
          humanScore: 0,
          confidence: 0
        }
      ]
    };
  }
};