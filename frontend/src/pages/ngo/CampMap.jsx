import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import API from "../../api/api";
import Navbar from "../../components/Navbar";

export default function CampMap() {
  const [riskAreas, setRiskAreas] = useState([]);
  const [camps, setCamps] = useState([]);
  const [deploying, setDeploying] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    API.get("/public/ai-risk/area")
      .then(res => setRiskAreas(res.data.data || []));

    API.get("/ngo/camps")
      .then(res => setCamps(res.data || []));
  }, []);

  const campByArea = {};
  camps.forEach(c => {
    campByArea[c.area.toLowerCase()] = c;
  });

  /* ⭐ COLOR LOGIC */
  const getColor = (risk, camp) => {
    if (camp && camp.status === "CLOSED") return "#7f8c8d";
    if (risk === "SEVERE") return "#8e44ad";
    if (risk === "HIGH") return "#e74c3c";
    if (risk === "MEDIUM") return "#f39c12";
    return "#2ecc71";
  };

  /* 🚑 DEPLOY CAMP */
  const deployCampFromMap = async (area) => {
    if (!window.confirm(`Deploy relief camp in ${area.area}?`)) return;

    try {
      setDeploying(area.area);

      const res = await API.post("/ngo/deploy-relief", {
        area: area.area,
        lat: area.lat,
        lng: area.lng,
        riskLevel: area.risk
      });

      const campId = res.data.camp._id;

      const updated = await API.get("/ngo/camps");
      setCamps(updated.data || []);

      navigate(`/ngo/camp/${campId}`);

    } catch (err) {
      alert("Failed to deploy camp");
    } finally {
      setDeploying(null);
    }
  };

  return (
    <>
      <Navbar />

      <div style={{ height: "85vh" }}>
        <MapContainer
          center={[28.6, 77.2]}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {riskAreas
            .filter(a => typeof a.lat === "number" && typeof a.lng === "number")
            .map(area => {

              const camp = campByArea[area.area.toLowerCase()];

              return (
                <CircleMarker
                  key={area.area}
                  center={[area.lat, area.lng]}
                  radius={
                    area.risk === "SEVERE"
                      ? 20
                      : area.risk === "HIGH"
                      ? 18
                      : 14
                  }
                  pathOptions={{
                    color: getColor(area.risk, camp),
                    fillColor: getColor(area.risk, camp),
                    fillOpacity: 0.85
                  }}
                >
                  <Popup>
                    <b>📍 {area.area}</b><br />
                    Risk: <b>{area.risk}</b><br />

                    {/* ⭐ DEPLOY BUTTON */}
                    {(area.risk === "HIGH" || area.risk === "SEVERE") && !camp && (
                      <>
                        <br />
                        <button
                          disabled={deploying === area.area}
                          onClick={() => deployCampFromMap(area)}
                          style={{
                            background:
                              area.risk === "SEVERE"
                                ? "#8e44ad"
                                : "#e74c3c",
                            color: "#fff",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: 5
                          }}
                        >
                          {deploying === area.area
                            ? "Deploying..."
                            : "🚑 Deploy Relief Camp"}
                        </button>
                      </>
                    )}

                    {/* ⭐ CAMP EXISTS */}
                    {camp && (
                      <>
                        <br />
                        Status: <b>{camp.status}</b><br /><br />

                        {camp.status === "ACTIVE" ? (
                          <button
                            onClick={() => navigate(`/ngo/camp/${camp._id}`)}
                            style={{
                              background: "#3498db",
                              color: "#fff",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: 5
                            }}
                          >
                            ⚙️ Open Operations
                          </button>
                        ) : (
                          <span style={{ color: "#555" }}>
                            🔒 Camp Closed
                          </span>
                        )}
                      </>
                    )}

                    {/* ⭐ MONITORING ONLY */}
                    {(area.risk === "LOW" || area.risk === "MEDIUM") && (
                      <p style={{ marginTop: 8, color: "#555" }}>
                        ℹ️ Monitoring only
                      </p>
                    )}

                  </Popup>
                </CircleMarker>
              );
            })}
        </MapContainer>
      </div>
    </>
  );
}
