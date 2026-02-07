import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/form.css";

export default function Register() {

  const [params] = useSearchParams();
  const navigate = useNavigate();
  const role = params.get("role");

  const register = async (e) => {
    e.preventDefault();

    const { name, email, password, phone } = e.target;

    try {

      await API.post("/auth/register", {
        name: name.value,
        email: email.value,
        password: password.value,
        phone: phone?.value,
        role
      });

      alert("Registered successfully. Please login.");
      navigate("/login");

    } catch {
      alert("Registration failed.");
    }
  };

  return (
    <form className="form" onSubmit={register}>

      <h2>{role?.toUpperCase()} Registration</h2>

      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />

      {/* ⭐ Volunteer only */}
      {role === "volunteer" && (
        <input name="phone" placeholder="Phone Number" required />
      )}

      <input name="password" type="password" placeholder="Password" required />

      <button type="submit">Register</button>

    </form>
  );
}
