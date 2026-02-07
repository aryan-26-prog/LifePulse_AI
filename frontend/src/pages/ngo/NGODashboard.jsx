import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import Navbar from "../../components/Navbar";
import "../../styles/dashboard.css";

export default function NGODashboard() {

  const [areas, setAreas] = useState([]);
  const [deploying, setDeploying] = useState(null);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  /* ================= LOAD AREAS + CAMPS ================= */
  const loadAreas = async () => {
    try {

      const riskRes = await API.get("/public/ai-risk/area");
      const campRes = await API.get("/ngo/camps");

      const campMap = {};
      (campRes.data || []).forEach(c => {
        campMap[c.area.toLowerCase()] = c;
      });

      const updated = (riskRes.data.data || []).map(a => {

        const camp = campMap[a.area.toLowerCase()];

        return {
          ...a,
          deployed: camp && camp.status !== "CLOSED",
          closed: camp && camp.status === "CLOSED",
          campId: camp?._id || null
        };
      });

      setAreas(updated);

    } catch {
      alert("Failed to load area data");
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  /* ================= AQI COLOR ================= */
  const getAQIColor = (aqi = 0) => {
    if (aqi <= 50) return "#2ecc71";
    if (aqi <= 100) return "#f1c40f";
    if (aqi <= 200) return "#e67e22";
    if (aqi <= 300) return "#e74c3c";
    return "#8e44ad";
  };

  /* ================= RISK COLOR ================= */
  const getRiskColor = (risk) => {
    if (risk === "SEVERE") return "#8e44ad";
    if (risk === "HIGH") return "#e74c3c";
    if (risk === "MEDIUM") return "#f39c12";
    return "#2ecc71";
  };

  /* ================= ACTION TEXT ================= */
  const actionText = (risk) => {
    if (risk === "SEVERE")
      return "Critical public health emergency. Immediate multi-resource deployment required.";

    if (risk === "HIGH")
      return "Urgent medical intervention recommended. Setup response camp.";

    if (risk === "MEDIUM")
      return "Monitor community health and initiate awareness drives.";

    return "Air quality safe. No intervention required.";
  };

  /* ================= DEPLOY CAMP ================= */
  const deployCamp = async (areaData) => {

    if (!window.confirm(`Initiate response setup in ${areaData.area}?`)) return;

    try {

      setDeploying(areaData.area);

      const res = await API.post("/ngo/deploy-relief", {
        area: areaData.area,
        lat: areaData.lat,
        lng: areaData.lng,
        riskLevel: areaData.risk
      });

      const campId = res.data.camp._id;

      setMessage(`Response setup initiated for ${areaData.area}`);

      await loadAreas();

      setTimeout(() => navigate(`/ngo/camp/${campId}`), 700);

    } catch {
      alert("Response setup failed");
    } finally {
      setDeploying(null);
    }
  };

  return (
    <>
      <Navbar />

      <div className="dashboard">

        <h2>🌐 NGO Emergency Control Center</h2>
        <p>AI-assisted environmental health surveillance & rapid response management</p>

        {message && (
          <div className="success-banner">
            {message}
          </div>
        )}

        <button
          className="map-btn"
          onClick={() => navigate("/ngo/camp-map")}
        >
          🗺️ Operational Map View
        </button>

        <div className="grid">

          {areas.map(a => {

            const aqi = Math.round(a.avgAQI || 0);
            const riskColor = getRiskColor(a.risk);

            const isDeployable = a.risk === "HIGH" || a.risk === "SEVERE";

            return (
              <div
                key={a.area}
                className="card advanced-card"
                style={{ borderLeft: `8px solid ${getAQIColor(aqi)}` }}
              >

                <div className="card-header">
                  <h3>{a.area}</h3>

                  <span
                    className="risk-badge"
                    style={{ background: riskColor }}
                  >
                    {a.risk}
                  </span>
                </div>

                <p>
                  <b>Air Quality Index:</b>{" "}
                  <span style={{ color: getAQIColor(aqi), fontWeight: 600 }}>
                    {aqi}
                  </span>
                </p>

                {a.confidence !== undefined && (
                  <div className="confidence-block">
                    <small>AI Confidence</small>

                    <div className="confidence-bar">
                      <div
                        className="confidence-fill"
                        style={{
                          width: `${a.confidence * 100}%`,
                          background: riskColor
                        }}
                      />
                    </div>
                  </div>
                )}

                <p><b>Average Stress:</b> {a.avgStress}</p>
                <p><b>Average Sleep:</b> {a.avgSleep} hrs</p>

                <div className="action-box">
                  <b>Recommended Response</b>
                  <p>{actionText(a.risk)}</p>
                </div>

                {/* ⭐ STRICT DEPLOY LOGIC */}
                {isDeployable && (

                  <button
                    disabled={a.closed || deploying === a.area}
                    onClick={() =>
                      a.campId
                        ? navigate(`/ngo/camp/${a.campId}`)
                        : deployCamp(a)
                    }
                    className="response-btn"
                    style={{
                      background:
                        a.closed
                          ? "#7f8c8d"
                          : a.deployed
                          ? "#3498db"
                          : a.risk === "SEVERE"
                          ? "#8e44ad"
                          : "#e74c3c"
                    }}
                  >

                    {a.closed
                      ? "🚫 Camp Closed"
                      : a.deployed
                      ? "🟢 Response Active"
                      : deploying === a.area
                      ? "Preparing Response..."
                      : "🚑 Initiate Response Setup"}

                  </button>

                )}

              </div>
            );
          })}

        </div>
      </div>
    </>
  );
}
