import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export function AreaBarChart({ data }) {
  const labels = data.map(d => d.area);
  const avgStress = data.map(d => d.avgStress);
  const avgSleep = data.map(d => d.avgSleep);

  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: "Avg Stress",
            data: avgStress,
            backgroundColor: "#ef4444"
          },
          {
            label: "Avg Sleep",
            data: avgSleep,
            backgroundColor: "#22c55e"
          }
        ]
      }}
      options={{ responsive: true, plugins: { legend: { position: "top" } } }}
    />
  );
}

export function RiskDonut({ data }) {
  const counts = data.reduce(
    (acc, cur) => {
      acc[cur.risk] = (acc[cur.risk] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <Doughnut
      data={{
        labels: Object.keys(counts),
        datasets: [
          {
            data: Object.values(counts),
            backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"]
          }
        ]
      }}
    />
  );
}
