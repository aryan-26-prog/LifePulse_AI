import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import {
  Activity,
  Shield,
  TrendingUp,
  Globe,
  AlertCircle,
  RefreshCw,
  Thermometer,
  Wind,
  Droplets,
  Users,
  MapPin,
  ChevronRight,
  Eye,
  Zap,
  Cpu,
  BarChart3,
  Clock,
  Target,
  Brain,
  Sparkles,
  Navigation,
  Ambulance,
  AlertTriangle,
  Lock
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

// Pulse Indicator Component
const PulseIndicator = () => (
  <div className="pulse-container">
    <div className="pulse-ring"></div>
    <div className="pulse-ring delay-1"></div>
    <div className="pulse-dot"></div>
  </div>
);

export default function NGODashboard() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);
  const navigate = useNavigate();

  const loadAreas = async () => {
    try {
      setLoading(true);
      const [riskRes, campRes] = await Promise.all([
        API.get("/public/ai-risk/area"),
        API.get("/ngo/camps")
      ]);

      const campMap = {};
      (campRes.data || []).forEach(c => {
        campMap[c.area.toLowerCase()] = c;
      });

      const updated = (riskRes.data?.data || []).map(a => {
        const camp = campMap[a.area.toLowerCase()];
        return {
          ...a,
          deployed: camp && camp.status === "ACTIVE",
          closed: camp && camp.status === "CLOSED",
          campId: camp?._id || null,
          population: Math.floor(Math.random() * 50000) + 10000
        };
      });

      setAreas(updated);
      setRefreshCount(prev => prev + 1);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
    const interval = setInterval(loadAreas, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Same functions as original
  const getAQIColor = (aqi = 0) => {
    if (aqi <= 50) return "#10b981";
    if (aqi <= 100) return "#f59e0b";
    if (aqi <= 200) return "#f97316";
    if (aqi <= 300) return "#ef4444";
    return "#dc2626";
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case "SEVERE": return "#8b5cf6";
      case "HIGH": return "#ef4444";
      case "MEDIUM": return "#f59e0b";
      default: return "#10b981";
    }
  };

  const getActionText = (risk) => {
    switch(risk) {
      case "SEVERE": return "Critical emergency. Immediate multi-resource deployment required.";
      case "HIGH": return "Urgent intervention needed. Setup response camp immediately.";
      case "MEDIUM": return "Monitor closely. Prepare preventive measures.";
      default: return "Situation stable. Routine monitoring recommended.";
    }
  };

  const deployCamp = async (area) => {
    try {
      const res = await API.post("/ngo/deploy-relief", {
        area: area.area,
        lat: area.lat,
        lng: area.lng,
        riskLevel: area.risk
      });
      
      loadAreas();
      navigate(`/ngo/camp/${res.data.camp._id}`);
    } catch (error) {
      alert("Failed to deploy camp");
    }
  };

  // Dashboard stats
  const metrics = [
    { 
      icon: <Activity size={20} />, 
      label: "Areas Monitored", 
      value: areas.length.toString(), 
      change: "+0%", 
      color: "#10b981" 
    },
    { 
      icon: <Shield size={20} />, 
      label: "High Risk Areas", 
      value: areas.filter(a => a.risk === "HIGH" || a.risk === "SEVERE").length.toString(), 
      change: "Critical", 
      color: "#ef4444" 
    },
    { 
      icon: <TrendingUp size={20} />, 
      label: "Active Camps", 
      value: areas.filter(a => a.deployed).length.toString(), 
      change: "+0", 
      color: "#3b82f6" 
    },
    { 
      icon: <Globe size={20} />, 
      label: "Closed Camps", 
      value: areas.filter(a => a.closed).length.toString(), 
      change: "Stable", 
      color: "#64748b" 
    },
  ];

  const alerts = areas
    .filter(a => a.risk === "HIGH" || a.risk === "SEVERE")
    .slice(0, 3)
    .map((area, i) => ({
      id: i + 1,
      type: area.risk === "SEVERE" ? "critical" : "warning",
      location: area.area,
      message: `${area.risk} risk detected`,
      time: "Just now"
    }));

  if (loading && areas.length === 0) {
    return (
      <div className="industrial-dashboard">
        <BackgroundAnimation />
        <div className="loading-container">
          <div className="loading-spinner">
            <RefreshCw size={32} className="spinning" />
          </div>
          <h2>Loading Emergency Control Center...</h2>
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
            <span>Emergency System Online</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="live-badge">
            <PulseIndicator />
            LIVE DATA
          </div>
          <div className="time-display">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* Main Hero Section - Same as Home */}
      <main className="dashboard-main">
        <div className="hero-section">
          <div className="hero-content">
            <div className="badge-container">
              <span className="industry-badge">EMERGENCY RESPONSE AI</span>
              <span className="version-badge">v2.4.1</span>
            </div>
            
            <h1 className="hero-title">
              NGO Emergency
              <span className="title-gradient"> Control Center</span>
              <br />
              <span className="title-sub">AI-Powered Relief Coordination</span>
            </h1>
            
            <p className="hero-description">
              Advanced environmental health surveillance system with AI-driven risk prediction 
              and automated response coordination for rapid humanitarian intervention.
            </p>
            
            {/* Quick Stats Row - Same as Home */}
            <div className="quick-stats">
              {metrics.map((metric, index) => (
                <div 
                  key={index} 
                  className={`quick-stat ${activeMetric === index ? 'active' : ''}`}
                  onClick={() => setActiveMetric(index)}
                >
                  <div className="stat-icon" style={{ color: metric.color }}>
                    {metric.icon}
                  </div>
                  <div className="stat-details">
                    <div className="stat-value">{metric.value}</div>
                    <div className="stat-label">{metric.label}</div>
                  </div>
                  <div className="stat-change">{metric.change}</div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="cta-section">
              <button 
                onClick={() => navigate("/ngo/camp-map")}
                className="primary-cta"
              >
                <span>View Operational Map</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          {/* Visual Data Panel - Same as Home */}
          <div className="data-visualization">
            <div className="viz-header">
              <h3>Live Risk Alerts</h3>
              <div className="viz-controls">
                <span className="viz-update">Updated just now</span>
              </div>
            </div>
            
            {/* Animated Wave Graph - Same as Home */}
            <div className="wave-graph">
              <div className="wave-container">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i} 
                    className="wave-bar"
                    style={{ 
                      height: `${30 + Math.sin(i * 0.5) * 20 + Math.random() * 10}%`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
              <div className="graph-labels">
                <span>12AM</span>
                <span>6AM</span>
                <span>12PM</span>
                <span>6PM</span>
                <span>12AM</span>
              </div>
            </div>
            
            {/* Live Alerts - Same as Home */}
            <div className="live-alerts">
              <div className="alerts-header">
                <AlertCircle size={18} />
                <span>Active Alerts</span>
                <span className="alert-count">{alerts.length}</span>
              </div>
              <div className="alert-list">
                {alerts.map(alert => (
                  <div key={alert.id} className={`alert-item ${alert.type}`}>
                    <div className="alert-icon"></div>
                    <div className="alert-content">
                      <div className="alert-location">{alert.location}</div>
                      <div className="alert-message">{alert.message}</div>
                    </div>
                    <div className="alert-time">{alert.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Areas Grid - Clean Version */}
        <div className="areas-section">
          <h2 className="section-title">Risk Zone Monitoring</h2>
          
          <div className="areas-grid">
            {areas.map((area) => {
              const aqi = Math.round(area.avgAQI || 0);
              const riskColor = getRiskColor(area.risk);
              const aqiColor = getAQIColor(aqi);
              
              return (
                <div 
                  key={area.area}
                  className="area-card"
                  style={{ borderLeft: `6px solid ${riskColor}` }}
                >
                  <div className="card-header">
                    <div className="location-info">
                      <MapPin size={18} />
                      <h3>{area.area}</h3>
                    </div>
                    <div className="risk-tag" style={{ background: riskColor }}>
                      {area.risk}
                    </div>
                  </div>
                  
                  <div className="card-metrics">
                    <div className="metric">
                      <Thermometer size={16} style={{ color: aqiColor }} />
                      <div>
                        <div className="metric-value" style={{ color: aqiColor }}>
                          {aqi}
                        </div>
                        <div className="metric-label">AQI</div>
                      </div>
                    </div>
                    
                    <div className="metric">
                      <Activity size={16} />
                      <div>
                        <div className="metric-value">{area.avgStress || "N/A"}</div>
                        <div className="metric-label">Stress</div>
                      </div>
                    </div>
                    
                    <div className="metric">
                      <Clock size={16} />
                      <div>
                        <div className="metric-value">{area.avgSleep || "N/A"}</div>
                        <div className="metric-label">Sleep (hrs)</div>
                      </div>
                    </div>
                    
                    {area.confidence !== undefined && (
                      <div className="confidence">
                        <div className="confidence-label">
                          <span>AI Confidence</span>
                          <span>{Math.round(area.confidence * 100)}%</span>
                        </div>
                        <div className="confidence-bar">
                          <div 
                            className="confidence-fill"
                            style={{ 
                              width: `${area.confidence * 100}%`,
                              background: riskColor 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-actions">
                    <div className="action-info">
                      <Zap size={14} />
                      <span>{getActionText(area.risk)}</span>
                    </div>
                    
                    <div className="action-buttons">
                      <button
                        className="view-btn"
                        onClick={() => navigate(`/area/${encodeURIComponent(area.area)}`)}
                      >
                        <Eye size={16} />
                        View Area
                      </button>
                      
                      {(area.risk === "HIGH" || area.risk === "SEVERE") && (
                        <button
                          className={`action-btn ${
                            area.closed 
                              ? "closed" 
                              : area.deployed 
                              ? "active" 
                              : "emergency"
                          }`}
                          onClick={() => {
                            if (area.campId) {
                              navigate(`/ngo/camp/${area.campId}`);
                            } else if (!area.closed) {
                              deployCamp(area);
                            }
                          }}
                          disabled={area.closed}
                        >
                          {area.closed ? (
                            <>
                              <Lock size={16} />
                              <span>Camp Closed</span>
                            </>
                          ) : area.deployed ? (
                            <>
                              <Activity size={16} />
                              <span>Manage Camp</span>
                              <ChevronRight size={16} />
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={16} />
                              <span>Deploy Response</span>
                              <ChevronRight size={16} />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {area.deployed && !area.closed && (
                    <div className="camp-status">
                      <div className="status-badge active">
                        <Ambulance size={12} />
                        Response Active
                      </div>
                    </div>
                  )}
                  
                  {area.closed && (
                    <div className="camp-status">
                      <div className="status-badge closed">
                        <Lock size={12} />
                        Camp Closed
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer - Same as Home */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">LifePulse AI Emergency</span>
              <span className="footer-tagline">Humanitarian Response Platform</span>
            </div>
            
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="stat-number">{areas.length}</span>
                <span className="stat-label">Zones</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">{refreshCount}</span>
                <span className="stat-label">Updates</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Monitoring</span>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <span>© 2024 LifePulse AI. Emergency Response System.</span>
            <div className="footer-links">
              <span onClick={() => navigate('/ngo/dashboard')}>Dashboard</span>
              <span onClick={() => navigate('/ngo/camp-map')}>Map</span>
              <span>Reports</span>
            </div>
          </div>
        </footer>
      </main>

      {/* Same CSS animations as Home */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.2); }
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
        
        .wave-bar {
          animation: wave 1.5s ease-in-out infinite;
          transform-origin: bottom;
        }
      `}</style>
    </div>
  );
}