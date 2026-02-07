import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Processing() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      navigate("/citizen/map");
    }, 2500); // AI feel delay

    return () => clearTimeout(t);
  }, []);

  return (
    <div className="container center">
      <h2>🧠 Analyzing community data…</h2>
      <p>AI is detecting risk patterns</p>
      <div style={{ fontSize: "2rem", marginTop: 20 }}>⏳</div>
    </div>
  );
}
