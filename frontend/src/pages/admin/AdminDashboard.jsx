import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function AdminDashboard() {

  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [areaStats, setAreaStats] = useState([]);
  const [aiRisk, setAIRisk] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  // 📥 Fetch Dashboard Data
  const fetchDashboard = async () => {
    try {

      const dash = await API.get("/admin/dashboard");
      setStats(dash.data.stats);

      const areas = await API.get("/admin/stats/area");
      setAreaStats(areas.data.data);

      const risk = await API.get("/admin/ai-risk/area");
      setAIRisk(risk.data.data);

      const rep = await API.get("/admin/reports");
      setReports(rep.data.data);

    } catch (err) {
      console.error(err);
    }
  };

  // 📄 CSV Download
  const downloadCSV = async () => {
    try {

      const response = await API.get("/admin/export/csv", {
        responseType: "blob"
      });

      const blob = new Blob([response.data], { type: "text/csv" });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "health_reports.csv";

      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error("CSV Download Error:", error);
    }
  };

  // 🗑 Delete Report
  const deleteReport = async (id) => {

    if (!window.confirm("Delete this report?")) return;

    try {

      await API.delete(`/admin/report/${id}`);

      setReports(reports.filter(r => r._id !== id));

    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // 📊 Chart Data
  const stressSleepChart = areaStats.map(a => ({
    area: a.area,
    stress: a.avgStress,
    sleep: a.avgSleep
  }));

  const riskChart = aiRisk.map(r => ({
    name: r.area,
    value: r.risk === "High" ? 100 :
           r.risk === "Medium" ? 60 : 30
  }));

  return (
    <div className="admin-container">

      <h1>🛠 Admin Control Panel</h1>

      {/* SUMMARY CARDS */}
      {stats && (
        <div className="summary-grid">

          <div className="card">
            <h3>Total Health Reports</h3>
            <h1>{stats.totalHealthReports}</h1>
          </div>

          <div className="card">
            <h3>Total NGOs</h3>
            <h1>{stats.totalNGOs}</h1>
          </div>

          <div className="card export">
            <h3>Export Health Data</h3>
            <button onClick={downloadCSV}>
              Download CSV
            </button>
          </div>

          <div className="card export">
            <h3>NGO Management</h3>
            <button onClick={() => navigate("/admin/ngos")}>
              Manage NGOs
            </button>
          </div>

        </div>
      )}

      {/* STRESS VS SLEEP */}
      <div className="card">
        <h2>📊 Area Stress vs Sleep</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stressSleepChart}>
            <XAxis dataKey="area" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="stress" fill="#ff7675" />
            <Bar dataKey="sleep" fill="#55efc4" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI RISK */}
      <div className="card">
        <h2>🧠 AI Risk Distribution</h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={riskChart}
              dataKey="value"
              outerRadius={120}
            >
              <Cell fill="#ff7675" />
              <Cell fill="#fdcb6e" />
              <Cell fill="#55efc4" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* AREA STATS TABLE */}
      <div className="card">
        <h2>📍 Area Health Statistics</h2>

        <table>
          <thead>
            <tr>
              <th>Area</th>
              <th>Reports</th>
              <th>Avg Stress</th>
              <th>Avg Sleep</th>
              <th>Symptoms</th>
            </tr>
          </thead>

          <tbody>
            {areaStats.map(a => (
              <tr key={a.area}>
                <td>{a.area}</td>
                <td>{a.totalReports}</td>
                <td>{a.avgStress}</td>
                <td>{a.avgSleep}</td>
                <td>{a.commonSymptoms?.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* HEALTH REPORTS TABLE */}
      <div className="card">
        <h2>🧾 Health Reports Moderation</h2>

        <table>
          <thead>
            <tr>
              <th>Area</th>
              <th>Sleep</th>
              <th>Stress</th>
              <th>Symptoms</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {reports.map(r => (
              <tr key={r._id}>
                <td>{r.location?.area}</td>
                <td>{r.sleep}</td>
                <td>{r.stress}</td>
                <td>{r.symptoms?.join(", ")}</td>

                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteReport(r._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
