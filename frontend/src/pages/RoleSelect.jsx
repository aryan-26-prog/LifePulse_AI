import { useNavigate } from "react-router-dom";
import "../styles/roleSelect.css";

export default function RoleSelect() {

  const navigate = useNavigate();

  return (
    <div className="role-container">

      <h1>Select Your Role</h1>
      <p>Choose how you want to use LifePulse AI</p>

      <div className="role-grid">

        {/* 👤 CITIZEN */}
        <div
          className="role-card citizen"
          onClick={() => navigate("/citizen/checkin")}
        >
          <h2>👤 Citizen</h2>
          <p>10-second anonymous health check-in</p>
        </div>

        {/* 🏥 NGO */}
        <div
          className="role-card ngo"
          onClick={() => navigate("/login?role=ngo")}
        >
          <h2>🏥 NGO</h2>
          <p>Register as NGO & view analytics</p>
        </div>

        {/* 🏛️ ADMIN */}
        <div
          className="role-card admin"
          onClick={() => navigate("/login?role=admin")}
        >
          <h2>🏛️ Admin</h2>
          <p>Register as city authority</p>
        </div>

        {/* ⭐ VOLUNTEER */}
        <div
          className="role-card volunteer"
          onClick={() => navigate("/login?role=volunteer")}
        >
          <h2>🤝 Volunteer</h2>
          <p>Join community relief & health campaigns</p>
        </div>

      </div>
    </div>
  );
}
