import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import API from "../../api/api";
import {
  Activity,
  AlertTriangle,
  MapPin,
  Users,
  Shield,
  Target,
  Navigation,
  Clock,
  RefreshCw,
  ChevronRight,
  Eye,
  Ambulance,
  Building2,
  Filter,
  Layers,
  Maximize2
} from "lucide-react";

// Same Background Animation Component as Home
const BackgroundAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 40;
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

// Map Controls Component
const MapControls = () => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    map.on('zoom', () => {
      setZoom(map.getZoom());
    });
  }, [map]);

  return (
    <div className="map-controls">
      <button 
        className="control-btn"
        onClick={() => map.zoomIn()}
        title="Zoom In"
      >
        <span>+</span>
      </button>
      <div className="zoom-level">
        {zoom}x
      </div>
      <button 
        className="control-btn"
        onClick={() => map.zoomOut()}
        title="Zoom Out"
      >
        <span>−</span>
      </button>
    </div>
  );
};

// Pulse Indicator
const PulseIndicator = () => (
  <div className="pulse-container">
    <div className="pulse-ring"></div>
    <div className="pulse-ring delay-1"></div>
    <div className="pulse-dot"></div>
  </div>
);

// Stat Card Component
const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + '20', color }}>
      {icon}
    </div>
    <div className="stat-content">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default function CampMap() {
  const [riskAreas, setRiskAreas] = useState([]);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [deploying, setDeploying] = useState(null);
  const navigate = useNavigate();

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [riskRes, campRes] = await Promise.all([
        API.get("/public/ai-risk/area"),
        API.get("/ngo/camps")
      ]);
      
      setRiskAreas(riskRes.data?.data || []);
      setCamps(campRes.data || []);
    } catch (error) {
      console.error("Failed to load map data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Create camp map
  const campByArea = {};
  camps.forEach(c => {
    campByArea[c.area.toLowerCase()] = c;
  });

  // Get color based on risk and camp status
  const getColor = (risk, camp) => {
    if (camp && camp.status === "CLOSED") return "#64748b";
    if (risk === "SEVERE") return "#dc2626";
    if (risk === "HIGH") return "#ef4444";
    if (risk === "MEDIUM") return "#f59e0b";
    return "#10b981";
  };

  // Get radius based on risk
  const getRadius = (risk) => {
    if (risk === "SEVERE") return 25;
    if (risk === "HIGH") return 22;
    if (risk === "MEDIUM") return 18;
    return 14;
  };

  // Filter areas
  const filteredAreas = riskAreas.filter(area => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'high-risk') return area.risk === "HIGH" || area.risk === "SEVERE";
    if (activeFilter === 'active-camps') {
      const camp = campByArea[area.area.toLowerCase()];
      return camp && camp.status === "ACTIVE";
    }
    if (activeFilter === 'needs-response') {
      const camp = campByArea[area.area.toLowerCase()];
      return (area.risk === "HIGH" || area.risk === "SEVERE") && !camp;
    }
    return true;
  });

  // Deploy camp function
  const deployCampFromMap = async (area) => {
    try {
      setDeploying(area.area);
      
      const res = await API.post("/ngo/deploy-relief", {
        area: area.area,
        lat: area.lat,
        lng: area.lng,
        riskLevel: area.risk
      });

      const campId = res.data.camp._id;
      
      // Refresh data
      await loadData();
      
      // Navigate to camp page
      navigate(`/ngo/camp/${campId}`);
    } catch (error) {
      console.error("Failed to deploy camp:", error);
    } finally {
      setDeploying(null);
    }
  };

  // Stats
  const stats = {
    totalAreas: riskAreas.length,
    highRisk: riskAreas.filter(a => a.risk === "HIGH" || a.risk === "SEVERE").length,
    activeCamps: camps.filter(c => c.status === "ACTIVE").length,
    needsResponse: riskAreas.filter(a => {
      const camp = campByArea[a.area.toLowerCase()];
      return (a.risk === "HIGH" || a.risk === "SEVERE") && !camp;
    }).length
  };

  if (loading && riskAreas.length === 0) {
    return (
      <div className="industrial-dashboard">
        <BackgroundAnimation />
        <div className="loading-container">
          <div className="loading-spinner">
            <RefreshCw size={32} className="spinning" />
          </div>
          <h2>Loading Operational Map...</h2>
          <p>Initializing geospatial data visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="industrial-dashboard">
      <BackgroundAnimation />
      
      {/* Header - Same as Home */}
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
            <span>Operational Map Online</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="live-badge">
            <PulseIndicator />
            LIVE MAP
          </div>
          <button 
            onClick={loadData}
            className="refresh-btn"
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
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
              <span className="industry-badge">OPERATIONAL MAP</span>
              <span className="version-badge">Real-time</span>
            </div>
            
            <h1 className="hero-title">
              Emergency Response
              <span className="title-gradient"> Operations Map</span>
            </h1>
            
            <p className="hero-description">
              Real-time geospatial visualization of risk zones, active relief camps, 
              and deployment opportunities across monitored regions.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="map-filters">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <Navigation size={16} />
            All Zones ({riskAreas.length})
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'high-risk' ? 'active' : ''}`}
            onClick={() => setActiveFilter('high-risk')}
          >
            <AlertTriangle size={16} />
            High Risk ({stats.highRisk})
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'active-camps' ? 'active' : ''}`}
            onClick={() => setActiveFilter('active-camps')}
          >
            <Ambulance size={16} />
            Active Camps ({stats.activeCamps})
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'needs-response' ? 'active' : ''}`}
            onClick={() => setActiveFilter('needs-response')}
          >
            <Shield size={16} />
            Needs Response ({stats.needsResponse})
          </button>
        </div>

        {/* Map Container */}
        <div className="map-container-wrapper">
          <div className="map-header">
            <div className="map-title">
              <MapPin size={20} />
              <h3>Operational Deployment Map</h3>
            </div>
            <div className="map-info">
              <span className="area-count">
                Showing {filteredAreas.length} of {riskAreas.length} areas
              </span>
              <span className="update-status">
                <Clock size={14} />
                Updated just now
              </span>
            </div>
          </div>
          
          <div className="map-container">
            <MapContainer
              center={[28.6, 77.2]}
              zoom={6}
              style={{ height: '100%', width: '100%', borderRadius: '12px' }}
              className="leaflet-container"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Map Controls */}
              <MapControls />
              
              {/* Risk Areas */}
              {filteredAreas
                .filter(a => typeof a.lat === "number" && typeof a.lng === "number")
                .map(area => {
                  const camp = campByArea[area.area.toLowerCase()];
                  const color = getColor(area.risk, camp);
                  const radius = getRadius(area.risk);
                  
                  return (
                    <CircleMarker
                      key={area.area}
                      center={[area.lat, area.lng]}
                      radius={radius}
                      pathOptions={{
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.8,
                        weight: 2
                      }}
                    >
                      <Popup className="map-popup">
                        <div className="popup-content">
                          <div className="popup-header">
                            <div className="location">
                              <MapPin size={16} />
                              <h4>{area.area}</h4>
                            </div>
                            <div 
                              className="risk-badge"
                              style={{ background: color }}
                            >
                              {area.risk}
                            </div>
                          </div>
                          
                          <div className="popup-metrics">
                            <div className="metric">
                              <span className="metric-label">AQI</span>
                              <span className="metric-value">{Math.round(area.avgAQI || 0)}</span>
                            </div>
                            <div className="metric">
                              <span className="metric-label">Stress</span>
                              <span className="metric-value">{area.avgStress || "N/A"}</span>
                            </div>
                            <div className="metric">
                              <span className="metric-label">Sleep</span>
                              <span className="metric-value">{area.avgSleep || "N/A"}h</span>
                            </div>
                          </div>
                          
                          {camp ? (
                            <div className="camp-info">
                              <div className="camp-status">
                                <Ambulance size={14} />
                                <span>Camp Status: </span>
                                <span className={`status ${camp.status.toLowerCase()}`}>
                                  {camp.status}
                                </span>
                              </div>
                              
                              <div className="popup-actions">
                                {camp.status === "ACTIVE" ? (
                                  <button
                                    className="popup-btn primary"
                                    onClick={() => navigate(`/ngo/camp/${camp._id}`)}
                                  >
                                    <Eye size={14} />
                                    Open Operations
                                    <ChevronRight size={14} />
                                  </button>
                                ) : (
                                  <div className="camp-closed">
                                    <span>Camp closed for operations</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="deployment-options">
                              {(area.risk === "HIGH" || area.risk === "SEVERE") ? (
                                <div className="popup-actions">
                                  <button
                                    className="popup-btn emergency"
                                    onClick={() => deployCampFromMap(area)}
                                    disabled={deploying === area.area}
                                  >
                                    {deploying === area.area ? (
                                      <>
                                        <RefreshCw className="spinning" size={14} />
                                        Deploying...
                                      </>
                                    ) : (
                                      <>
                                        <Ambulance size={14} />
                                        Deploy Relief Camp
                                        <ChevronRight size={14} />
                                      </>
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <div className="monitoring-info">
                                  <span>Status: Monitoring only</span>
                                  <button
                                    className="popup-btn outline"
                                    onClick={() => navigate(`/area/${encodeURIComponent(area.area)}`)}
                                  >
                                    View Area Details
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
            </MapContainer>
          </div>
          
          <div className="map-footer">
            <div className="footer-info">
              <span>• Click markers for area details</span>
              <span>• Zoom with mouse wheel or +/- buttons</span>
              <span>• Drag to pan the map</span>
            </div>
            <button 
              className="fullscreen-btn"
              onClick={() => {
                const elem = document.querySelector('.leaflet-container');
                if (elem.requestFullscreen) {
                  elem.requestFullscreen();
                }
              }}
            >
              <Maximize2 size={16} />
              Fullscreen
            </button>
          </div>
        </div>

        {/* Footer - Same as Home */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">LifePulse AI Operations</span>
              <span className="footer-tagline">Geospatial Intelligence Platform</span>
            </div>
            
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="stat-number">{riskAreas.length}</span>
                <span className="stat-label">Zones</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">{stats.activeCamps}</span>
                <span className="stat-label">Active</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">Real-time</span>
                <span className="stat-label">Tracking</span>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <span>© 2024 LifePulse AI. Operational Map Interface.</span>
            <div className="footer-links">
              <span onClick={() => navigate('/ngo/dashboard')}>Dashboard</span>
              <span onClick={() => navigate('/ngo/camp-map')}>Map</span>
              <span>Reports</span>
            </div>
          </div>
        </footer>
      </main>

      {/* Same CSS animations as Home */}
      <style >{`
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .spinning {
          animation: spin 2s linear infinite;
        }
        
        .pulse-container {
          position: relative;
          width: 20px;
          height: 20px;
        }
        
        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid #10b981;
          border-radius: 50%;
          animation: pulse 2s ease-out infinite;
        }
        
        .pulse-ring.delay-1 {
          animation-delay: 1s;
        }
        
        .pulse-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}