import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/api";
import Navbar from "../../components/Navbar";
import "../../styles/dashboard.css";

export default function CampOperations() {

  const { campId } = useParams();

  const [camp, setCamp] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [closing, setClosing] = useState(false);

  const [message, setMessage] = useState("");

  /* ================= FETCH CAMP ================= */
  const fetchCamp = async () => {
    const res = await API.get(`/ngo/camp/${campId}`);
    setCamp(res.data);
  };

  /* ================= FETCH VOLUNTEERS ================= */
  const fetchVolunteers = async () => {
    const res = await API.get("/ngo/volunteers");

    // ⭐ Only available volunteers
    setVolunteers(res.data.data.filter(v => v.available));
  };

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchCamp(), fetchVolunteers()]);
      } catch {
        alert("Failed to load camp data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [campId]);

  /* ================= SELECT VOLUNTEER ================= */
  const toggleVolunteer = (id) => {

    if (selectedVolunteers.includes(id)) {
      setSelectedVolunteers(prev => prev.filter(v => v !== id));
    } else {
      setSelectedVolunteers(prev => [...prev, id]);
    }
  };

  /* ================= ASSIGN SELECTED ================= */
  const assignVolunteers = async () => {

    if (!selectedVolunteers.length) {
      return alert("Please select volunteers first");
    }

    if (!window.confirm("Assign selected volunteers?")) return;

    try {

      setAssigning(true);

      const res = await API.post("/ngo/assign-volunteers", {
        campId,
        volunteerIds: selectedVolunteers
      });

      setMessage(`✅ ${res.data.count} volunteers assigned`);

      setSelectedVolunteers([]);

      await fetchCamp();
      await fetchVolunteers();

    } catch {
      alert("Volunteer assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  /* ================= CLOSE CAMP ================= */
  const closeCamp = async () => {

    if (!window.confirm("Close this camp?")) return;

    try {

      setClosing(true);

      await API.post("/ngo/close-camp", { campId });

      setMessage("🚫 Camp closed successfully");
      await fetchCamp();

    } catch {
      alert("Failed to close camp");
    } finally {
      setClosing(false);
    }
  };

  if (loading || !camp) {
    return <p style={{ padding: 20 }}>⏳ Loading camp operations...</p>;
  }

  /* ================= RISK COLOR ================= */
  const riskColor =
    camp.riskLevel === "SEVERE"
      ? "#8e44ad"
      : camp.riskLevel === "HIGH"
      ? "#e74c3c"
      : camp.riskLevel === "MEDIUM"
      ? "#f39c12"
      : "#2ecc71";

  return (
    <>
      <Navbar />

      <div className="dashboard">
        <h2>🏕️ Relief Camp Operations</h2>

        {message && (
          <div className="success-banner">
            {message}
          </div>
        )}

        {/* CAMP INFO */}
        <div className="card">
          <h3>📍 {camp.area}</h3>
          <p>Status: {camp.status}</p>
          <p>Risk: <span style={{ color: riskColor }}>{camp.riskLevel}</span></p>
        </div>

        {/* ================= SELECT VOLUNTEERS ================= */}
        <div className="card" style={{ marginTop: 20 }}>

          <h3>🧑‍🤝‍🧑 Select Volunteers</h3>

          {volunteers.length === 0 ? (
            <p>No available volunteers</p>
          ) : (
            volunteers.map(v => (
              <div key={v._id} style={{ marginBottom: 8 }}>

                <input
                  type="checkbox"
                  checked={selectedVolunteers.includes(v._id)}
                  onChange={() => toggleVolunteer(v._id)}
                />

                <b style={{ marginLeft: 8 }}>{v.name}</b>
                <span style={{ marginLeft: 10 }}>📞 {v.phone}</span>

                {v.completedCamps > 0 && (
                  <span style={{ marginLeft: 10, opacity: 0.7 }}>
                    ⭐ {v.completedCamps} Camps
                  </span>
                )}

              </div>
            ))
          )}

          {camp.status !== "CLOSED" && (
            <button
              style={{ marginTop: 10 }}
              onClick={assignVolunteers}
              disabled={assigning}
            >
              {assigning ? "Assigning..." : "Assign Selected Volunteers"}
            </button>
          )}
        </div>

        {/* ================= ASSIGNED VOLUNTEERS ================= */}
        <div className="card" style={{ marginTop: 20 }}>

          <h3>👥 Assigned Volunteers</h3>

          {camp.volunteerAssigned?.length > 0 ? (
            camp.volunteerAssigned.map(v => (
              <div key={v._id}>
                <b>{v.name}</b>
                <br />
                📞 {v.phone}
              </div>
            ))
          ) : (
            <p>⚠️ No volunteers assigned</p>
          )}

          {camp.status !== "CLOSED" && (
            <button
              style={{ marginTop: 15 }}
              onClick={closeCamp}
              disabled={closing}
            >
              {closing ? "Closing..." : "🚫 Close Camp"}
            </button>
          )}
        </div>

      </div>
    </>
  );
}
