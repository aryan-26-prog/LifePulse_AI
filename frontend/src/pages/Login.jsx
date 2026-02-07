import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/form.css";

export default function Login() {

  const navigate = useNavigate();

  const [role, setRole] = useState("ngo");

  const login = async (e) => {
    e.preventDefault();

    const { email, password } = e.target;

    try {

      const res = await API.post("/auth/login", {
        email: email.value,
        password: password.value
      });

      const userRole = res.data.user.role;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", userRole);

      if (userRole === "volunteer") {
        localStorage.setItem("volunteerId", res.data.volunteerId);
      }

      // Redirect
      if (userRole === "admin") window.location.href = "/admin";
      else if (userRole === "ngo") window.location.href = "/ngo";
      else if (userRole === "volunteer") window.location.href = "/volunteer";

    } catch {
      alert("Invalid credentials or blocked account");
    }
  };

  return (
    <form className="form" onSubmit={login}>

      <h2>Login</h2>

      {/* ⭐ ROLE SELECTOR */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="ngo">NGO</option>
        <option value="admin">Admin</option>
        <option value="volunteer">Volunteer</option>
      </select>

      <input name="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />

      <button type="submit">Login</button>

      {/* ⭐ REGISTER OPTION */}
      <p style={{ marginTop: 15 }}>
        New {role}?{" "}
        <span
          style={{ color: "#007bff", cursor: "pointer" }}
          onClick={() => navigate(`/register?role=${role}`)}
        >
          Register Here
        </span>
      </p>

    </form>
  );
}
