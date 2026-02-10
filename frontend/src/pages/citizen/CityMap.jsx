import { useEffect, useState, useRef } from "react";
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
import {
  Activity,
  Filter,
  MapPin,
  Navigation,
  AlertCircle,
  ChevronRight,
  Layers,
  TrendingUp
} from "lucide-react";

import API from "../../api/api";

/* ================= BACKGROUND ANIMATION ================= */
const BackgroundAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 60;
    const mouse = { x: width * 0.5, y: height * 0.5, radius: 100 };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.speedY = Math.random() * 0.8 - 0.4;
        this.color = Math.random() > 0.5 ? 'rgba(37, 99, 235, 0.15)' : 'rgba(16, 185, 129, 0.15)';
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > height || this.y < 0) this.speedY = -this.speedY;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          this.x -= dx * force * 0.02;
          this.y -= dy * force * 0.02;
        }
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const connect = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.strokeStyle = `rgba(37, 99, 235, ${0.08 * (1 - distance/100)})`;
            ctx.lineWidth = 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connect();
      requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};

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
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState({
    totalAreas: 0,
    avgAQI: 0,
    highRisk: 0
  });

  const navigate = useNavigate();

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    API.get("/public/ai-risk/area")
      .then(res => {
        const data = res.data?.data || [];
        setAreas(data);
        setFilteredAreas(data);
        
        // Calculate stats
        const total = data.length;
        const avg = Math.round(data.reduce((sum, a) => sum + (a.avgAQI || 0), 0) / total);
        const highRisk = data.filter(a => (a.risk || "LOW") === "HIGH" || (a.risk || "LOW") === "SEVERE").length;
        
        setStats({
          totalAreas: total,
          avgAQI: avg,
          highRisk: highRisk
        });
      })
      .catch(() => {
        // Silent fail for production
        console.error("Unable to load city health data");
      });
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
      },
      null,
      { enableHighAccuracy: true }
    );
  }, []);

  /* ================= MOBILE CHECK ================= */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleUserLocationClick = () => {
    if (!userLocation) return;
    navigate(`/citizen/area/user?lat=${userLocation.lat}&lng=${userLocation.lng}`);
  };

  /* ================= COLORS ================= */
  const getAQIColor = (aqi = 50) => {
    if (aqi <= 50) return "#10b981";      // Green
    if (aqi <= 100) return "#f59e0b";     // Yellow
    if (aqi <= 200) return "#f97316";     // Orange
    if (aqi <= 300) return "#ef4444";     // Red
    return "#8b5cf6";                     // Purple
  };

  const getRiskColor = (risk) => {
    if (risk === "SEVERE") return "#8b5cf6";  // Purple
    if (risk === "HIGH") return "#ef4444";    // Red
    if (risk === "MEDIUM") return "#f59e0b";  // Yellow
    return "#10b981";                         // Green
  };

  const validAreas = filteredAreas.filter(a => a.lat && a.lng);

  return (
    <div className="industrial-dashboard">
      {/* Background Animation */}
      <BackgroundAnimation />
      
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <Activity size={24} />
            </div>
            <div className="logo-text">
              <span className="logo-main">LifePulse</span>
              <span className="logo-sub">AI</span>
            </div>
          </div>
          <div className="status-indicator">
            <div className="status-dot active"></div>
            <span>Live Tracking</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="live-badge">
            <div className="live-pulse"></div>
            REAL-TIME
          </div>
          <div className="time-display">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="hero-section">
          <div className="hero-content">
            <div className="badge-container">
              <span className="industry-badge">HEATMAP INTELLIGENCE</span>
              <span className="version-badge">v1.2.0</span>
            </div>
            
            <h1 className="hero-title">
              City Health
              <span className="title-gradient"> Surveillance</span>
              <br />
              <span className="title-sub">Geospatial Analytics</span>
            </h1>
            
            <p className="hero-description">
              Interactive heatmap visualization of air quality and health risks across metropolitan areas.
              Real-time monitoring with predictive risk assessment.
            </p>
            
            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="quick-stat active">
                <div className="stat-icon" style={{ color: "#3b82f6" }}>
                  <MapPin size={20} />
                </div>
                <div className="stat-details">
                  <div className="stat-value">{stats.totalAreas}</div>
                  <div className="stat-label">Monitored Areas</div>
                </div>
                <div className="stat-change">+{areas.length}</div>
              </div>
              
              <div className="quick-stat">
                <div className="stat-icon" style={{ color: stats.avgAQI <= 50 ? "#10b981" : stats.avgAQI <= 100 ? "#f59e0b" : "#ef4444" }}>
                  <Activity size={20} />
                </div>
                <div className="stat-details">
                  <div className="stat-value">{stats.avgAQI}</div>
                  <div className="stat-label">Avg AQI</div>
                </div>
                <div className="stat-change">{stats.avgAQI <= 50 ? "Good" : "Moderate"}</div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="cta-section">
              <div className="filter-controls">
                <div className="filter-header">
                  <Filter size={18} />
                  <span>Risk Filter</span>
                </div>
                <select
                  className="modern-select"
                  value={aqiFilter}
                  onChange={(e) => setAqiFilter(e.target.value)}
                >
                  <option value="ALL">🌐 All Risk Levels</option>
                  <option value="GOOD">🟢 Good (0-50 AQI)</option>
                  <option value="MODERATE">🟡 Moderate (51-100 AQI)</option>
                  <option value="POOR">🟠 Poor (101-200 AQI)</option>
                  <option value="VERY_POOR">🔴 Very Poor (201-300 AQI)</option>
                  <option value="SEVERE">🟣 Severe (300+ AQI)</option>
                </select>
              </div>

              <div className="cta-options">
                {userLocation && (
                  <button className="secondary-cta" onClick={handleUserLocationClick}>
                    <Navigation size={18} />
                    <span>My Location</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Map Visualization */}
          <div className="data-visualization">
            <div className="viz-header">
              <h3>Geospatial Heatmap</h3>
              <div className="viz-controls">
                <span className="viz-update">{validAreas.length} active zones</span>
              </div>
            </div>
            
            {/* Interactive Map */}
            <div className="map-container" style={{ height: "500px", borderRadius: "12px", overflow: "hidden", position: "relative" }}>
              <div className="map-overlay-controls">
                <div className="map-control">
                  <Layers size={16} />
                  <span>Heatmap</span>
                </div>
                <div className="map-control">
                  <span>Radius: 35m</span>
                </div>
              </div>
              
              <MapContainer
                center={[28.6, 77.2]}
                zoom={5}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%", background: "#0f172a" }}
              >
                <TileLayer
                  attribution="© OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  className="map-tiles"
                />

                <HeatLayer areas={validAreas} />

                {userLocation && (
                  <>
                    <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />
                    <CircleMarker
                      center={[userLocation.lat, userLocation.lng]}
                      radius={14}
                      pathOptions={{
                        color: "#3b82f6",
                        fillColor: "#3b82f6",
                        fillOpacity: 0.9,
                        weight: 2
                      }}
                      eventHandlers={{ click: handleUserLocationClick }}
                    >
                      <Popup className="modern-popup">
                        <div className="popup-header">
                          <Navigation size={14} />
                          <strong>Your Location</strong>
                        </div>
                        <div className="popup-content">
                          <div>Lat: {userLocation.lat.toFixed(4)}</div>
                          <div>Lng: {userLocation.lng.toFixed(4)}</div>
                        </div>
                        <button className="popup-button" onClick={handleUserLocationClick}>
                          View Details <ChevronRight size={12} />
                        </button>
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
                        fillOpacity: 0.85,
                        weight: 2
                      }}
                      eventHandlers={{
                        click: () => navigate(`/citizen/area/${a.area}`)
                      }}
                    >
                      <Popup className="modern-popup">
                        <div className="popup-header">
                          <MapPin size={14} />
                          <strong>{a.area}</strong>
                        </div>
                        <div className="popup-stats">
                          <div className="popup-stat">
                            <span>AQI:</span>
                            <strong style={{ color: getAQIColor(aqi) }}> {aqi}</strong>
                          </div>
                          <div className="popup-stat">
                            <span>Risk:</span>
                            <strong style={{ color: getRiskColor(risk) }}> {risk}</strong>
                          </div>
                        </div>
                        <button 
                          className="popup-button"
                          onClick={() => navigate(`/citizen/area/${a.area}`)}
                        >
                          View Analytics <ChevronRight size={12} />
                        </button>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Enhanced Areas Grid */}
        <div className="monitored-areas-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <h2 className="section-title">
                <span className="title-gradient">Monitored Areas</span>
                <span className="title-badge">{filteredAreas.length} zones</span>
              </h2>
              <p className="section-subtitle">
                Click any area for detailed health analytics and risk assessment
              </p>
            </div>
            
            <div className="section-controls">
              <div className="view-toggle">
                <button className="view-btn active">
                  <Layers size={16} />
                  Grid View
                </button>
              </div>
            </div>
          </div>

          {/* Areas Stats Bar */}
          <div className="areas-stats-bar">
            <div className="stat-item">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <Activity size={16} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{filteredAreas.length}</span>
                <span className="stat-label">Active Zones</span>
              </div>
            </div>
            
            <div className="stat-divider"></div>
            
            <div className="stat-item">
              <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                <TrendingUp size={16} />
              </div>
              <div className="stat-content">
                <span className="stat-value">
                  {filteredAreas.length > 0 
                    ? Math.round(filteredAreas.reduce((sum, a) => sum + (a.avgAQI || 0), 0) / filteredAreas.length)
                    : 0}
                </span>
                <span className="stat-label">Avg AQI</span>
              </div>
            </div>
            
            <div className="stat-divider"></div>
            
            <div className="stat-item">
              <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
                <Filter size={16} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{aqiFilter === 'ALL' ? 'All' : aqiFilter}</span>
                <span className="stat-label">Active Filter</span>
              </div>
            </div>
          </div>

          {/* Enhanced Grid */}
          <div className="areas-grid-enhanced">
            {filteredAreas.map((a, index) => {
              const aqi = Math.round(a.avgAQI || 0);
              const risk = a.risk || "LOW";
              const isHighRisk = risk === 'HIGH' || risk === 'SEVERE';

              return (
                <div
                  key={a.area}
                  className="area-card-enhanced"
                  onClick={() => navigate(`/citizen/area/${a.area}`)}
                  data-risk={risk.toLowerCase()}
                  style={{
                    '--border-color': getAQIColor(aqi),
                    '--risk-color': getRiskColor(risk)
                  }}
                >
                  {/* Card Badge */}
                  <div className="card-badge">
                    <span className="badge-index">#{index + 1}</span>
                    {isHighRisk && (
                      <span className="badge-alert">
                        <AlertCircle size={12} />
                        Priority
                      </span>
                    )}
                  </div>

                  {/* Card Header */}
                  <div className="card-header">
                    <div className="area-icon-wrapper">
                      <div className="area-icon" style={{ background: `${getAQIColor(aqi)}20` }}>
                        <MapPin size={20} style={{ color: getAQIColor(aqi) }} />
                      </div>
                    </div>
                    <h3 className="area-name">{a.area}</h3>
                    <div className="area-risk-tag" style={{ background: `${getRiskColor(risk)}20`, color: getRiskColor(risk) }}>
                      {risk}
                    </div>
                  </div>

                  {/* AQI Meter */}
                  <div className="aqi-meter">
                    <div className="meter-header">
                      <span>Air Quality Index</span>
                      <span className="aqi-value" style={{ color: getAQIColor(aqi) }}>
                        {aqi}
                      </span>
                    </div>
                    <div className="meter-bar">
                      <div 
                        className="meter-fill"
                        style={{
                          width: `${Math.min((aqi / 500) * 100, 100)}%`,
                          background: getAQIColor(aqi)
                        }}
                      ></div>
                      <div className="meter-markers">
                        <span>0</span>
                        <span>100</span>
                        <span>200</span>
                        <span>300</span>
                        <span>400+</span>
                      </div>
                    </div>
                    <div className="meter-status" style={{ color: getAQIColor(aqi) }}>
                      {aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 200 ? 'Poor' : aqi <= 300 ? 'Very Poor' : 'Severe'}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="quick-stats-grid">
                    <div className="stat-box">
                      <div className="stat-label">Latitude</div>
                      <div className="stat-value">{a.lat?.toFixed(4) || 'N/A'}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">Longitude</div>
                      <div className="stat-value">{a.lng?.toFixed(4) || 'N/A'}</div>
                    </div>
                    {a.population && (
                      <div className="stat-box">
                        <div className="stat-label">Population</div>
                        <div className="stat-value">{(a.population / 1000).toFixed(1)}k</div>
                      </div>
                    )}
                    <div className="stat-box">
                      <div className="stat-label">Last Update</div>
                      <div className="stat-value">Live</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="card-actions">
                    <button 
                      className="view-details-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/citizen/area/${a.area}`);
                      }}
                    >
                      View Detailed Analytics
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Hover Effect */}
                  <div className="card-hover-effect"></div>
                </div>
              );
            })}
          </div>
          
          {/* Empty State */}
          {filteredAreas.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <Filter size={48} />
              </div>
              <h3>No Areas Found</h3>
              <p>Try adjusting your AQI filter settings</p>
              <button 
                className="reset-filter-btn"
                onClick={() => setAqiFilter("ALL")}
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">LifePulse AI</span>
              <span className="footer-tagline">Geospatial Health Intelligence</span>
            </div>
            
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="stat-number">{validAreas.length}</span>
                <span className="stat-label">Active Zones</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Monitoring</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">Real-time</span>
                <span className="stat-label">Updates</span>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <span>© 2024 CityPulse AI. All rights reserved.</span>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Documentation</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}