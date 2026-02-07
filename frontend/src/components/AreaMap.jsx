import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const colorByRisk = (risk) => {
  if (risk === "HIGH") return "red";
  if (risk === "MEDIUM") return "orange";
  return "green";
};

export default function AreaMap({ data }) {
  return (
    <MapContainer
      center={[28.62, 77.21]}
      zoom={12}
      style={{ height: "420px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {data.map((a, idx) => (
        <CircleMarker
          key={idx}
          center={[a.lat || 28.62, a.lng || 77.21]}
          radius={18}
          pathOptions={{ color: colorByRisk(a.risk) }}
        >
          <Popup>
            <b>{a.area}</b><br />
            Risk: {a.risk}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
