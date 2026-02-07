import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import VolunteerMap from "./VolunteerMap";
import "../../styles/dashboard.css";
import socket from "../../utils/sockets";

export default function VolunteerDashboard() {

  const [volunteer, setVolunteer] = useState(null);
  const [assignedCamp, setAssignedCamp] = useState(null);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  const volunteerId = localStorage.getItem("volunteerId");
  const navigate = useNavigate();

  /* ================= SOCKET SETUP ================= */
  useEffect(() => {

    if (!volunteerId || volunteerId === "null") return;

    /* ⭐ FIXED ROOM NAME */
    socket.emit("joinVolunteer", volunteerId);

    /* APPROVED */
    const approvedListener = (data) => {
      alert(`✅ Report Approved! XP +${data.xpEarned}`);
      loadDashboard();
    };

    /* REJECTED */
    const rejectedListener = (data) => {
      alert(`❌ Report Rejected: ${data.feedback}`);
    };

    socket.on("reportApproved", approvedListener);
    socket.on("reportRejected", rejectedListener);

    return () => {
      socket.off("reportApproved", approvedListener);
      socket.off("reportRejected", rejectedListener);
    };

  }, [volunteerId]);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {

    if (!volunteerId || volunteerId === "null") return;

    loadAll();

  }, [volunteerId]);

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([loadDashboard(), loadCamps()]);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    const res = await API.get(`/volunteers/${volunteerId}/dashboard`);
    setVolunteer(res.data.volunteer);
    setAssignedCamp(res.data.assignedCamp);
  };

  const loadCamps = async () => {
    const res = await API.get("/volunteers/active-camps");
    setCamps(res.data.data || []);
  };

  const joinCamp = async (id) => {
    try {
      await API.put(`/volunteers/${volunteerId}/join`, { campId: id });
      await loadDashboard();
    } catch {
      alert("Unable to join camp");
    }
  };

  const leaveCamp = async () => {
    try {
      await API.put(`/volunteers/${volunteerId}/leave`);
      await loadDashboard();
    } catch {
      alert("Unable to leave camp");
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <h2>Loading Volunteer Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard">

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>🤝 Volunteer Control Center</h2>

        <button
          onClick={() => navigate("/volunteer/profile")}
          className="primary-btn"
        >
          👤 Profile
        </button>
      </div>

      {assignedCamp ? (
        <div className="card danger">

          <h3>🚑 Assigned Relief Camp</h3>

          <p><b>Area:</b> {assignedCamp.area}</p>
          <p><b>Risk Level:</b> {assignedCamp.riskLevel}</p>

          <button
            onClick={() =>
              navigate(`/volunteer/report/${assignedCamp._id}`)
            }
            style={{ marginRight: 10 }}
          >
            📤 Submit Work Report
          </button>

          <button onClick={leaveCamp}>
            Leave Camp
          </button>

        </div>
      ) : (
        <div className="card">
          <h3>✅ You are available for deployment</h3>
        </div>
      )}

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

      <VolunteerMap camps={camps} />

    </div>
  );
}
