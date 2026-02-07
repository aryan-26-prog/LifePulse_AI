import { useEffect, useState } from "react";
import API from "../../api/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

export default function ReportAnalytics() {

  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const res = await API.get("/admin/analytics/reports");
    setData(res.data);
  };

  if (!data) return <p>Loading Analytics...</p>;

  return (
    <div className="admin-container">

      <h2>📊 Report Analytics</h2>

      {/* ⭐ Reports Per Area */}
      <h3>Reports Per Area</h3>

      <BarChart width={500} height={300} data={data.reportsPerArea}>
        <XAxis dataKey="_id" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" />
      </BarChart>

      {/* ⭐ Stress vs Sleep */}
      <h3>Average Stress vs Sleep</h3>

      <LineChart
        width={500}
        height={300}
        data={[
          { name: "Stress", value: data.stressSleep.avgStress },
          { name: "Sleep", value: data.stressSleep.avgSleep }
        ]}
      >
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line dataKey="value" />
      </LineChart>

      {/* ⭐ Symptoms Pie Chart */}
      <h3>Top Symptoms</h3>

      <PieChart width={400} height={300}>
        <Pie
          data={data.symptoms}
          dataKey="count"
          nameKey="_id"
          outerRadius={100}
        >
          {data.symptoms.map((_, index) => (
            <Cell key={index} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>

    </div>
  );
}
