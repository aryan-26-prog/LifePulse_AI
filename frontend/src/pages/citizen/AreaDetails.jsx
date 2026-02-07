import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import API from "../../api/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

const REFRESH_INTERVAL = 5 * 60;

export default function AreaDetails() {
  const { areaName } = useParams();
  const [params] = useSearchParams();
  const lat = params.get("lat");
  const lng = params.get("lng");

  const [env, setEnv] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const timerRef = useRef();

  const fetchData = async () => {
    try {
      if (lat && lng) {
        const res = await API.get(
          `/public/environment/coords?lat=${lat}&lng=${lng}`
        );
        setEnv(res.data);
      } else {
        const res = await API.get(
          `/public/environment/area?area=${areaName}`
        );
        setEnv(res.data);

        const hist = await API.get(
          `/public/environment/history?area=${areaName}`
        );
        setHistory(hist.data);
      }

      setCountdown(REFRESH_INTERVAL);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();

    const refresh = setInterval(fetchData, REFRESH_INTERVAL * 1000);

    timerRef.current = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(refresh);
      clearInterval(timerRef.current);
    };
  }, [areaName, lat, lng]);

  if (loading || !env) {
    return <p style={{ padding: 20 }}>🔄 Initializing live environment feed…</p>;
  }

  const getAQIColor = (a) => {
    if (a <= 50) return "#2ecc71";
    if (a <= 100) return "#f1c40f";
    if (a <= 200) return "#e67e22";
    if (a <= 300) return "#e74c3c";
    return "#8e44ad";
  };

  const trend =
    history.length >= 2
      ? history[history.length - 1].aqi -
        history[history.length - 2].aqi
      : 0;

  const trendSymbol =
    trend > 5 ? "📈 Rising" :
    trend < -5 ? "📉 Falling" :
    "➖ Stable";

  const pollutantData = Object.entries(env.aqi.pollutants).map(
    ([k, v]) => ({ name: k.toUpperCase(), value: v })
  );

  const dominantPollutant = pollutantData.reduce((a, b) =>
    a.value > b.value ? a : b
  );

  // ⭐ HEALTH DATA
  const healthScore = env.health?.score ?? 0;
  const healthStatus = env.health?.status ?? "";

  // ⭐ Suggestions array fix
  const suggestions = env.health?.suggestions ?? [];

  const exposurePercent = Math.min(
    100,
    Math.round((env.aqi.index / 500) * 100)
  );

  return (
    <div className="dashboard">

      <h2>
        🌍 Live Environmental Control Room
        <span style={{ color: "red", fontSize: 14, animation: "blink 1s infinite" }}>
          ● LIVE
        </span>
      </h2>

      <p style={{ opacity: 0.6 }}>
        ⏱ Next refresh in {countdown}s
      </p>

      {/* AQI HERO */}
      <div className="card">
        <h3>Air Quality Index</h3>
        <h1 style={{ color: getAQIColor(env.aqi.index), fontSize: 60 }}>
          {env.aqi.index}
        </h1>
        <p>{env.aqi.label}</p>
        <p>{trendSymbol}</p>
      </div>

      {/* RISK */}
      <div
        className="card"
        style={{
          marginTop: 15,
          background: getAQIColor(env.aqi.index),
          color: "#fff"
        }}
      >
        <h3>⚠️ Area Risk Status</h3>
        <p>
          {env.aqi.index <= 100
            ? "Safe for general public."
            : env.aqi.index <= 200
            ? "Sensitive groups at risk."
            : "Emergency-level pollution. Immediate action required."}
        </p>
      </div>

      {/* WEATHER */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3>🌤️ Live Weather</h3>
        <p>🌡️ {env.weather.temp} °C</p>
        <p>💧 {env.weather.humidity}%</p>
        <p>🌬️ {env.weather.windSpeed} m/s</p>
        <p>☁️ {env.weather.condition}</p>
      </div>

      {/* AQI HISTORY */}
      {history.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3>📊 AQI Movement</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={history}>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(t) =>
                  new Date(t).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                }
              />
              <YAxis domain={[0, 500]} />
              <Tooltip
                labelFormatter={(t) =>
                  new Date(t).toLocaleString("en-IN")
                }
              />
              <Line
                dataKey="aqi"
                stroke={getAQIColor(env.aqi.index)}
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* POLLUTION */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3>🧪 Pollutant Intensity</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={pollutantData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#ff7675" />
          </BarChart>
        </ResponsiveContainer>

        <p style={{ marginTop: 10 }}>
          🚨 Dominant Pollutant: <b>{dominantPollutant.name}</b>
        </p>
      </div>

      {/* HEALTH */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3>❤️ Health Impact Analysis</h3>

        <h1>{healthScore}/100</h1>
        <p><b>{healthStatus}</b></p>
        <p>Exposure Intensity: {exposurePercent}%</p>

        {/* ⭐ Suggestions Rendering */}
        <div style={{ marginTop: 15 }}>
          <h4>🩺 Smart Suggestions</h4>
          <ul>
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={[
                { name: "Health Stress", value: healthScore },
                { name: "Safe Capacity", value: 100 - healthScore }
              ]}
              innerRadius={70}
              outerRadius={100}
              dataKey="value"
            >
              <Cell fill={getAQIColor(env.aqi.index)} />
              <Cell fill="#ecf0f1" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
