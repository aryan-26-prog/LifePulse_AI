import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function VolunteerMap({ camps }) {

  const getRiskColor = (risk) => {
    if (risk === "SEVERE") return "#8e44ad";
    if (risk === "HIGH") return "#e74c3c";
    if (risk === "MEDIUM") return "#f39c12";
    return "#2ecc71";
  };

  return (
    <div style={{ height: "450px", marginTop: 30 }}>

      <MapContainer
        center={[28.6, 77.2]}
        zoom={5}
        style={{ height: "100%" }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {camps.map(c => (

          <CircleMarker
            key={c.id}
            center={[c.lat, c.lng]}
            radius={18}
            pathOptions={{
              color: getRiskColor(c.riskLevel),
              fillOpacity: 0.8
            }}
          >

            <Popup>
              <b>{c.area}</b><br/>
              Risk: {c.riskLevel}<br/>
              Volunteers: {c.volunteersCount}
            </Popup>

          </CircleMarker>

        ))}

      </MapContainer>

    </div>
  );
}
