import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function OTPVerify() {

  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const userId = localStorage.getItem("pendingUser");

  const verify = async () => {

    try {

      await API.post("/auth/verify-otp", {
        userId,
        otp
      });

      alert("Email verified!");
      navigate("/login");

    } catch {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="form">
      <h2>Enter OTP</h2>

      <input
        placeholder="Enter OTP"
        value={otp}
        onChange={e => setOtp(e.target.value)}
      />

      <button onClick={verify}>Verify</button>
    </div>
  );
}
