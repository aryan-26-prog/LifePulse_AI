import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/api";
import Navbar from "../../components/Navbar";
import "../../styles/dashboard.css";
import socket from "../../utils/sockets";

export default function CampOperations() {

  const { campId } = useParams();

  const [camp, setCamp] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [closing, setClosing] = useState(false);

  const [message, setMessage] = useState("");

  const fetchCamp = async () => {
    const res = await API.get(`/ngo/camp/${campId}`);
    setCamp(res.data);
  };

  const fetchVolunteers = async () => {
    const res = await API.get("/ngo/volunteers");
    setVolunteers(res.data.data.filter(v => v.available));
  };

  const fetchReports = async () => {
    const res = await API.get(`/work-report/camp/${campId}`);
    setReports(res.data.data || []);
  };

  useEffect(() => {

    const load = async () => {
      try {
        await Promise.all([
          fetchCamp(),
          fetchVolunteers(),
          fetchReports()
        ]);
      } finally {
        setLoading(false);
      }
    };

    load();

  }, [campId]);

  /* ================= SOCKET REALTIME ================= */
  useEffect(() => {

    socket.emit("joinNGO");

    const newReportListener = (data) => {

      if (data.campId === campId) {
        setMessage("📢 New volunteer report submitted");
        fetchReports();
      }

    };

    socket.on("newWorkReport", newReportListener);

    return () => {
      socket.off("newWorkReport", newReportListener);
    };

  }, [campId]);

  const toggleVolunteer = (id) => {

    if (selectedVolunteers.includes(id)) {
      setSelectedVolunteers(prev => prev.filter(v => v !== id));
    } else {
      setSelectedVolunteers(prev => [...prev, id]);
    }
  };

  const assignVolunteers = async () => {

    if (!selectedVolunteers.length)
      return alert("Select volunteers");

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

    } finally {
      setAssigning(false);
    }
  };

  const closeCamp = async () => {

    if (!window.confirm("Close this camp?")) return;

    try {
      setClosing(true);
      await API.post("/ngo/close-camp", { campId });
      await fetchCamp();
    } finally {
      setClosing(false);
    }
  };

  const approveReport = async (id) => {
    await API.put(`/work-report/approve/${id}`);
    await fetchReports();
  };

  const rejectReport = async (id) => {

    const feedback = prompt("Enter rejection reason");
    if (!feedback) return;

    await API.put(`/work-report/reject/${id}`, { feedback });
    await fetchReports();
  };

  if (loading || !camp) return <p>Loading...</p>;

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

        <div className="card">
          <h3>{camp.area}</h3>
          <p>Status: {camp.status}</p>
          <p>Risk: {camp.riskLevel}</p>
        </div>

        <div className="card" style={{ marginTop: 20 }}>

          <h3>Select Volunteers</h3>

          {volunteers.map(v => (
            <div key={v._id}>
              <input
                type="checkbox"
                checked={selectedVolunteers.includes(v._id)}
                onChange={() => toggleVolunteer(v._id)}
              />
              <b>{v.name}</b> 📞 {v.phone}
            </div>
          ))}

          {camp.status !== "CLOSED" && (
            <button onClick={assignVolunteers} disabled={assigning}>
              Assign Selected Volunteers
            </button>
          )}

        </div>

        <div className="card" style={{ marginTop: 20 }}>

          <h3>Assigned Volunteers</h3>

          {camp.volunteerAssigned?.map(v => (
            <div key={v._id}>
              <b>{v.name}</b> 📞 {v.phone}
            </div>
          ))}

          {camp.status !== "CLOSED" && (
            <button onClick={closeCamp} disabled={closing}>
              Close Camp
            </button>
          )}

        </div>

        <div className="card" style={{ marginTop: 20 }}>

          <h3>📋 Volunteer Work Reports</h3>

          {reports.length === 0 ? (
            <p>No reports submitted yet</p>
          ) : (
            reports.map(r => (
              <div key={r._id} style={{ borderBottom: "1px solid #eee", marginBottom: 15 }}>

                <b>{r.volunteer?.name}</b>

                <p>{r.description}</p>

                <p>
                  👥 Helped: {r.peopleHelped} |
                  ⏱ Hours: {r.hoursWorked}
                </p>

                {r.images?.map(img => (
                  <img
                    key={img}
                    src={`http://localhost:5000/${img}`}
                    alt=""
                    width="120"
                    style={{ marginRight: 8 }}
                  />
                ))}

                <p>Status: {r.status}</p>

                {r.status === "PENDING" && (
                  <>
                    <button onClick={() => approveReport(r._id)}>
                      Approve
                    </button>

                    <button onClick={() => rejectReport(r._id)}>
                      Reject
                    </button>
                  </>
                )}

              </div>
            ))
          )}

        </div>

      </div>
    </>
  );
}
