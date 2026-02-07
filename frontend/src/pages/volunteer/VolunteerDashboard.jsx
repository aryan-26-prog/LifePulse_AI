import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ⭐ Added
import API from "../../api/api";
import VolunteerMap from "./VolunteerMap";
import "../../styles/dashboard.css";

export default function VolunteerDashboard() {

  const [volunteer, setVolunteer] = useState(null);
  const [assignedCamp, setAssignedCamp] = useState(null);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  const volunteerId = localStorage.getItem("volunteerId");
  const navigate = useNavigate(); // ⭐ Added

  /* ================= LOAD DATA ================= */
  useEffect(() => {

    if (!volunteerId || volunteerId === "null") {
      console.warn("Volunteer ID missing");
      return;
    }

    loadAll();

  }, [volunteerId]);

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([loadDashboard(), loadCamps()]);
      setLoading(false);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setLoading(false);
    }
  };

  /* ================= DASHBOARD ================= */
  const loadDashboard = async () => {

    const res = await API.get(`/volunteers/${volunteerId}/dashboard`);

    setVolunteer(res.data.volunteer);
    setAssignedCamp(res.data.assignedCamp);
  };

  /* ================= CAMPS ================= */
  const loadCamps = async () => {

    const res = await API.get("/volunteers/active-camps");
    setCamps(res.data.data || []);
  };

  /* ================= JOIN CAMP ================= */
  const joinCamp = async (id) => {

    try {

      await API.put(`/volunteers/${volunteerId}/join`, {
        campId: id
      });

      await loadDashboard();

    } catch (err) {
      alert("Unable to join camp");
    }
  };

  /* ================= LEAVE CAMP ================= */
  const leaveCamp = async () => {

    try {

      await API.put(`/volunteers/${volunteerId}/leave`);
      await loadDashboard();

    } catch (err) {
      alert("Unable to leave camp");
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="dashboard">
        <h2>Loading Volunteer Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* ⭐ HEADER WITH PROFILE BUTTON */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>🤝 Volunteer Control Center</h2>

        <button
          onClick={() => navigate("/volunteer/profile")}
          style={{
            padding: "8px 15px",
            borderRadius: "8px",
            border: "none",
            background: "#4CAF50",
            color: "white",
            cursor: "pointer"
          }}
        >
          👤 Profile
        </button>
      </div>

      {/* ================= ASSIGNED CAMP ================= */}
      {assignedCamp ? (
        <div className="card danger">

          <h3>🚑 Assigned Relief Camp</h3>

          <p><b>Area:</b> {assignedCamp.area}</p>
          <p><b>Risk Level:</b> {assignedCamp.riskLevel}</p>

          <button onClick={leaveCamp}>
            Leave Camp
          </button>

        </div>
      ) : (
        <div className="card">
          <h3>✅ You are available for deployment</h3>
        </div>
      )}

      {/* ================= ACTIVE CAMPS ================= */}
      <div className="grid">

        {camps.map(c => (

          <div key={c.id} className="card">

            <h3>{c.area}</h3>

            <p>Risk: {c.riskLevel}</p>
            <p>Volunteers: {c.volunteersCount}</p>

            {!assignedCamp && (
              <button onClick={() => joinCamp(c.id)}>
                Join Camp
              </button>
            )}

          </div>

        ))}

      </div>

      {/* ================= DEPLOYMENT MAP ================= */}
      <VolunteerMap camps={camps} />

    </div>
  );
}
