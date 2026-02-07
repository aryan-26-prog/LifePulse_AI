import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

import API from "../../api/api";
import "../../styles/dashboard.css";

/* ================= HEATMAP LAYER ================= */
function HeatLayer({ areas }) {
  const map = useMap();

  useEffect(() => {
    if (!areas?.length) return;

    const points = areas
      .filter(a => a.lat && a.lng)
      .map(a => [
        a.lat,
        a.lng,
        Math.min((a.avgAQI || 50) / 300, 1)
      ]);

    if (!points.length) return;

    const heat = L.heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 10
    });

    heat.addTo(map);
    return () => map.removeLayer(heat);

  }, [areas, map]);

  return null;
}

/* ================= RECENTER ================= */
function RecenterMap({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 10);
    }
  }, [lat, lng, map]);

  return null;
}

export default function CityMap() {

  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [aqiFilter, setAqiFilter] = useState("ALL");
  const [userLocation, setUserLocation] = useState(null);

  const navigate = useNavigate();

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    API.get("/public/ai-risk/area")
      .then(res => {
        const data = res.data?.data || [];
        setAreas(data);
        setFilteredAreas(data);
      })
      .catch(() => alert("Unable to load city health data"));
  }, []);

  /* ================= AQI FILTER ================= */
  useEffect(() => {

    if (aqiFilter === "ALL") {
      setFilteredAreas(areas);
      return;
    }

    const filtered = areas.filter(a => {
      const aqi = a.avgAQI || 0;

      if (aqiFilter === "GOOD") return aqi <= 50;
      if (aqiFilter === "MODERATE") return aqi > 50 && aqi <= 100;
      if (aqiFilter === "POOR") return aqi > 100 && aqi <= 200;
      if (aqiFilter === "VERY_POOR") return aqi > 200 && aqi <= 300;
      if (aqiFilter === "SEVERE") return aqi > 300;

      return true;
    });

    setFilteredAreas(filtered);

  }, [aqiFilter, areas]);

  /* ================= USER GPS ================= */
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      }
    );
  }, []);

  const handleUserLocationClick = () => {
    if (!userLocation) return;

    navigate(`/citizen/area/user?lat=${userLocation.lat}&lng=${userLocation.lng}`);
  };

  /* ================= COLORS ================= */
  const getAQIColor = (aqi = 50) => {
    if (aqi <= 50) return "#2ecc71";
    if (aqi <= 100) return "#f1c40f";
    if (aqi <= 200) return "#e67e22";
    if (aqi <= 300) return "#e74c3c";
    return "#8e44ad";
  };

  const getRiskColor = (risk) => {
    if (risk === "SEVERE") return "#8e44ad";
    if (risk === "HIGH") return "#e74c3c";
    if (risk === "MEDIUM") return "#f39c12";
    return "#2ecc71";
  };

  const validAreas = filteredAreas.filter(a => a.lat && a.lng);

  return (
    <div className="dashboard">

      <h2>🏙️ City Health Map</h2>

      {/* ⭐ AQI FILTER */}
      <div style={{ marginBottom: 15 }}>
        <select
          value={aqiFilter}
          onChange={(e) => setAqiFilter(e.target.value)}
        >
          <option value="ALL">All AQI</option>
          <option value="GOOD">🟢 Good (0-50)</option>
          <option value="MODERATE">🟡 Moderate (51-100)</option>
          <option value="POOR">🟠 Poor (101-200)</option>
          <option value="VERY_POOR">🔴 Very Poor (201-300)</option>
          <option value="SEVERE">🟣 Severe (300+)</option>
        </select>
      </div>

      <div style={{ height: "500px", borderRadius: "12px", overflow: "hidden" }}>
        <MapContainer
          center={[28.6, 77.2]}
          zoom={5}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >

          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <HeatLayer areas={validAreas} />

          {userLocation && (
            <>
              <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />

              <CircleMarker
                center={[userLocation.lat, userLocation.lng]}
                radius={14}
                pathOptions={{
                  color: "#007bff",
                  fillColor: "#007bff",
                  fillOpacity: 0.9
                }}
                eventHandlers={{ click: handleUserLocationClick }}
              >
                <Popup>
                  📍 You are here
                </Popup>
              </CircleMarker>
            </>
          )}

          {validAreas.map((a, i) => {

            const aqi = Math.round(a.avgAQI || 0);
            const risk = a.risk || "LOW";

            return (
              <CircleMarker
                key={i}
                center={[a.lat, a.lng]}
                radius={18}
                pathOptions={{
                  color: getAQIColor(aqi),
                  fillColor: getAQIColor(aqi),
                  fillOpacity: 0.85
                }}
                eventHandlers={{
                  click: () => navigate(`/citizen/area/${a.area}`)
                }}
              >
                <Popup>
                  <b>{a.area}</b><br />
                  AQI: <b>{aqi}</b><br />
                  Health Risk:
                  <b style={{ color: getRiskColor(risk) }}>
                    {" "}{risk}
                  </b>
                </Popup>
              </CircleMarker>
            );
          })}

        </MapContainer>
      </div>

      {/* CARDS */}
      <div className="grid" style={{ marginTop: 30 }}>
        {filteredAreas.map(a => {

          const aqi = Math.round(a.avgAQI || 0);
          const risk = a.risk || "LOW";

          return (
            <div
              key={a.area}
              className="card"
              style={{ borderLeft: `8px solid ${getAQIColor(aqi)}` }}
              onClick={() => navigate(`/citizen/area/${a.area}`)}
            >
              <h3>{a.area}</h3>

              <p>
                AQI:
                <strong style={{ color: getAQIColor(aqi) }}>
                  {" "}{aqi}
                </strong>
              </p>

              <p>
                Health Risk:
                <strong style={{ color: getRiskColor(risk) }}>
                  {" "}{risk}
                </strong>
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
