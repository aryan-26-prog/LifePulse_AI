import { useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api/api";
import "../styles/form.css";

export default function Register() {

  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [ngoRegistrationId, setNgoRegistrationId] = useState("");

  const register = async (e) => {
    e.preventDefault();

    if (!role) {
      alert("Please select a role");
      return;
    }

    const { name, email, password, phone } = e.target;

    try {

      const payload = {
        name: name.value,
        email: email.value,
        password: password.value,
        role
      };

      /* ⭐ Volunteer → Phone */
      if (role === "volunteer") {
        payload.phone = phone.value;
      }

      /* ⭐ NGO → Registration ID */
      if (role === "ngo") {
        payload.ngoRegistrationId = ngoRegistrationId;
      }

      const res = await API.post("/auth/register", payload);

      /* ⭐ OTP verification */
      localStorage.setItem("pendingUser", res.data.userId);

      alert("OTP sent to your email");

      navigate("/verify-otp");

    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <form className="form" onSubmit={register}>

      <h2>Register Account</h2>

      {/* ⭐ Role Dropdown */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        required
      >
        <option value="">Select Role</option>
        <option value="ngo">NGO</option>
        <option value="volunteer">Volunteer</option>
        <option value="admin">Admin</option>
      </select>

      {/* Name */}
      <input name="name" placeholder="Name" required />

      {/* Email */}
      <input name="email" type="email" placeholder="Email" required />

      {/* ⭐ Volunteer Phone */}
      {role === "volunteer" && (
        <input name="phone" placeholder="Phone Number" required />
      )}

      {/* ⭐ NGO Registration ID */}
      {role === "ngo" && (
        <input
          name="ngoRegistrationId"
          placeholder="NGO Registration ID"
          value={ngoRegistrationId}
          onChange={(e) => setNgoRegistrationId(e.target.value)}
          required
        />
      )}

      {/* Password */}
      <input name="password" type="password" placeholder="Password" required />

      <button type="submit">Register</button>

    </form>
  );
}
