import { Link, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import "../styles/navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <span className="logo">🧠 LifePulse AI</span>
      </div>

      <div className="nav-right">
        {!isLoggedIn && (
          <>
            <Link to="/">Home</Link>
            <Link to="/select-role">Get Started</Link>
          </>
        )}

        {isLoggedIn && role === "admin" && (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/area-stats">Area Stats</Link>
            <Link to="/admin/ai-risk">AI Risk</Link>
          </>
        )}

        {isLoggedIn && role === "ngo" && (
          <>
            <Link to="/ngo">NGO Dashboard</Link>
          </>
        )}

        {isLoggedIn && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
