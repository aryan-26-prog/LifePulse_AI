import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { AlertCircle, Users, MapPin, Activity } from "lucide-react";

// Background Animation Component (same as home)
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
        position: 'absolute',
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

// Main Volunteer Map Component
export default function VolunteerMap({ camps }) {
  const getRiskColor = (risk) => {
    if (risk === "SEVERE") return "#8e44ad";
    if (risk === "HIGH") return "#e74c3c";
    if (risk === "MEDIUM") return "#f39c12";
    return "#2ecc71";
  };

  const getRiskGradient = (risk) => {
    if (risk === "SEVERE") return "linear-gradient(135deg, #8e44ad, #9b59b6)";
    if (risk === "HIGH") return "linear-gradient(135deg, #e74c3c, #ff6b6b)";
    if (risk === "MEDIUM") return "linear-gradient(135deg, #f39c12, #f1c40f)";
    return "linear-gradient(135deg, #2ecc71, #27ae60)";
  };

  const getRiskIcon = (risk) => {
    switch(risk) {
      case "SEVERE": return "🔴";
      case "HIGH": return "🟠";
      case "MEDIUM": return "🟡";
      default: return "🟢";
    }
  };

  // Calculate stats
  const totalVolunteers = camps.reduce((sum, camp) => sum + camp.volunteersCount, 0);
  const highRiskCamps = camps.filter(camp => camp.riskLevel === "HIGH" || camp.riskLevel === "SEVERE").length;
  const avgVolunteers = camps.length > 0 ? Math.round(totalVolunteers / camps.length) : 0;

  return (
    <div className="industrial-dashboard">
      {/* Background Animation */}
      <BackgroundAnimation />
      
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <MapPin size={24} />
            </div>
            <div className="logo-text">
              <span className="logo-main">Volunteer Map</span>
              <span className="logo-sub">LIVE</span>
            </div>
          </div>
          <div className="status-indicator">
            <div className="status-dot active"></div>
            <span>Real-time Tracking</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="live-badge">
            <div className="live-pulse"></div>
            LIVE COVERAGE
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
              <span className="industry-badge">CAMP MONITORING</span>
              <span className="version-badge">v2.0</span>
            </div>
            
            <h1 className="hero-title">
              Volunteer Deployment
              <span className="title-gradient"> Intelligence</span>
              <br />
              <span className="title-sub">Real-time Geospatial Tracking</span>
            </h1>
            
            <p className="hero-description">
              Interactive map showing volunteer distribution across camps with risk-level assessment.
              Monitor and manage resources efficiently.
            </p>
            
            {/* Stats Overview */}
            <div className="quick-stats">
              <div className="quick-stat active">
                <div className="stat-icon" style={{ color: "#3b82f6" }}>
                  <MapPin size={20} />
                </div>
                <div className="stat-details">
                  <div className="stat-value">{camps.length}</div>
                  <div className="stat-label">Active Camps</div>
                </div>
                <div className="stat-change">+{Math.floor(camps.length * 0.1)}</div>
              </div>
              
              <div className="quick-stat">
                <div className="stat-icon" style={{ color: "#10b981" }}>
                  <Users size={20} />
                </div>
                <div className="stat-details">
                  <div className="stat-value">{totalVolunteers}</div>
                  <div className="stat-label">Volunteers</div>
                </div>
                <div className="stat-change">↗ {avgVolunteers}/camp</div>
              </div>
              
              <div className="quick-stat">
                <div className="stat-icon" style={{ color: "#e74c3c" }}>
                  <AlertCircle size={20} />
                </div>
                <div className="stat-details">
                  <div className="stat-value">{highRiskCamps}</div>
                  <div className="stat-label">High Risk</div>
                </div>
                <div className="stat-change">Monitor</div>
              </div>
              
              <div className="quick-stat">
                <div className="stat-icon" style={{ color: "#8b5cf6" }}>
                  <Activity size={20} />
                </div>
                <div className="stat-details">
                  <div className="stat-value">{Math.round((camps.length - highRiskCamps) / camps.length * 100)}%</div>
                  <div className="stat-label">Stable</div>
                </div>
                <div className="stat-change">+5.2%</div>
              </div>
            </div>

            {/* Legend */}
            <div className="map-legend">
              <div className="legend-title">Risk Level Legend</div>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-color" style={{ background: "#2ecc71" }}></div>
                  <span>Low</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: "#f39c12" }}></div>
                  <span>Medium</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: "#e74c3c" }}></div>
                  <span>High</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: "#8e44ad" }}></div>
                  <span>Severe</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Map Container */}
          <div className="data-visualization">
            <div className="viz-header">
              <h3>Live Camp Distribution</h3>
              <div className="viz-controls">
                <span className="viz-update">{camps.length} camps active</span>
              </div>
            </div>
            
            <div className="map-container-wrapper">
              <div style={{ 
                height: "450px", 
                width: "100%",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                <MapContainer
                  center={[28.6, 77.2]}
                  zoom={5}
                  style={{ height: "100%", width: "100%" }}
                  className="volunteer-map"
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  {camps.map(c => (
                    <CircleMarker
                      key={c.id}
                      center={[c.lat, c.lng]}
                      radius={Math.max(8, Math.min(25, c.volunteersCount / 5))}
                      pathOptions={{
                        fillColor: getRiskColor(c.riskLevel),
                        color: "#ffffff",
                        weight: 2,
                        opacity: 0.8,
                        fillOpacity: 0.8,
                        className: "camp-marker"
                      }}
                    >
                      <Popup className="custom-popup">
                        <div className="popup-content">
                          <div className="popup-header">
                            <span className="risk-badge" style={{ background: getRiskGradient(c.riskLevel) }}>
                              {getRiskIcon(c.riskLevel)} {c.riskLevel}
                            </span>
                            <h4>{c.area}</h4>
                          </div>
                          <div className="popup-stats">
                            <div className="popup-stat">
                              <Users size={16} />
                              <span><strong>{c.volunteersCount}</strong> Volunteers</span>
                            </div>
                            <div className="popup-stat">
                              <MapPin size={16} />
                              <span>{c.lat.toFixed(2)}, {c.lng.toFixed(2)}</span>
                            </div>
                          </div>
                          {c.description && (
                            <p className="popup-desc">{c.description}</p>
                          )}
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="live-alerts">
              <div className="alerts-header">
                <AlertCircle size={18} />
                <span>Recent Deployments</span>
                <span className="alert-count">{Math.min(5, camps.length)}</span>
              </div>
              <div className="alert-list">
                {camps.slice(0, 5).map((camp, index) => (
                  <div key={index} className="alert-item info">
                    <div className="alert-icon" style={{ background: getRiskGradient(camp.riskLevel) }}></div>
                    <div className="alert-content">
                      <div className="alert-location">{camp.area}</div>
                      <div className="alert-message">{camp.volunteersCount} volunteers deployed</div>
                    </div>
                    <div className="alert-time" style={{ color: getRiskColor(camp.riskLevel) }}>
                      {camp.riskLevel}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">Volunteer Network</span>
              <span className="footer-tagline">Real-time Coordination Platform</span>
            </div>
            
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="stat-number">{camps.length}</span>
                <span className="stat-label">Camps</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">{totalVolunteers}</span>
                <span className="stat-label">Volunteers</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Monitoring</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}