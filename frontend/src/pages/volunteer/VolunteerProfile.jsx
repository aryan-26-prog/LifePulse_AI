import { useEffect, useState } from "react";
import API from "../../api/api";
import "../../styles/dashboard.css";
import socket from "../../utils/sockets"; // ⭐ SOCKET

export default function VolunteerProfile() {

  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);

  const volunteerId = localStorage.getItem("volunteerId");

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    if (!volunteerId || volunteerId === "null") return;

    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {

      const res = await API.get(`/volunteers/${volunteerId}/dashboard`);
      setVolunteer(res.data.volunteer);
      setLoading(false);

    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SOCKET REALTIME ================= */
  useEffect(() => {

    if (!volunteerId || volunteerId === "null") return;

    // ⭐ Join volunteer room
    socket.emit("joinRoom", volunteerId);

    // ⭐ When NGO approves report
    socket.on("reportApproved", (data) => {

      alert(`🎉 Report Approved! XP +${data.xpEarned}`);
      loadProfile(); // refresh profile realtime
    });

    // ⭐ When NGO rejects report
    socket.on("reportRejected", (data) => {

      alert(`❌ Report Rejected: ${data.feedback}`);
    });

    return () => {
      socket.off("reportApproved");
      socket.off("reportRejected");
    };

  }, [volunteerId]);

  if (loading || !volunteer) {
    return <div className="dashboard">Loading profile...</div>;
  }

  /* ===== XP PROGRESS ===== */
  const nextLevelXP = 200;

  const progress = Math.min(
    ((volunteer.xp || 0) / nextLevelXP) * 100,
    100
  );

  return (
    <div className="dashboard">

      <h2>🙋 Volunteer Profile</h2>

      {/* ===== BASIC INFO ===== */}
      <div className="card">
        <h3>{volunteer.name}</h3>
        <p>📞 {volunteer.phone || "Not Provided"}</p>

        <p>
          Status:
          <strong style={{color: volunteer.available ? "green" : "red"}}>
            {" "}
            {volunteer.available ? "Available" : "Deployed"}
          </strong>
        </p>
      </div>

      {/* ===== XP + LEVEL ===== */}
      <div className="card">
        <h3>⭐ Volunteer Progress</h3>

        <p>
          Level:
          <strong> {volunteer.level || "Rookie"}</strong>
        </p>

        <p>
          XP:
          <strong> {volunteer.xp || 0}</strong>
        </p>

        {/* Progress Bar */}
        <div style={{background:"#eee", height:12, borderRadius:8}}>
          <div
            style={{
              width:`${progress}%`,
              height:"100%",
              background:"#4CAF50",
              borderRadius:8
            }}
          />
        </div>
      </div>

      {/* ===== CURRENT ASSIGNMENT ===== */}
      <div className="card">
        <h3>🚑 Current Deployment</h3>

        {volunteer.assignedCamp ? (
          <>
            <p>Area: {volunteer.assignedCamp.area}</p>
            <p>Risk Level: {volunteer.assignedCamp.riskLevel}</p>
            <p>Status: {volunteer.assignedCamp.status}</p>
          </>
        ) : (
          <p>Not assigned to any camp</p>
        )}
      </div>

      {/* ===== STATS ===== */}
      <div className="card">
        <h3>📊 Contribution Stats</h3>

        <p>
          Completed Camps:
          <strong> {volunteer.completedCamps || 0}</strong>
        </p>

        <p>
          People Helped:
          <strong> {volunteer.totalPeopleHelped || 0}</strong>
        </p>

        <p>
          Hours Served:
          <strong> {volunteer.totalHours || 0}</strong>
        </p>

        <p>
          Badges Earned:
          <strong> {volunteer.badges?.length || 0}</strong>
        </p>
      </div>

      {/* ===== BADGES ===== */}
      <div className="card">

        <h3>🏆 Achievements</h3>

        {volunteer.badges?.length > 0 ? (

          <div className="badge-grid">

            {volunteer.badges.map((b, i) => (

              <div key={i} className="badge">

                <span style={{fontSize:"32px"}}>{b.icon}</span>

                <h4>{b.name}</h4>
                <small>{b.description}</small>

              </div>
            ))}

          </div>

        ) : (
          <p>No badges earned yet</p>
        )}

      </div>

    </div>
  );
}
