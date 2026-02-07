import { useEffect, useState, useRef } from "react";
import { 
  Activity, 
  Shield, 
  TrendingUp, 
  Globe, 
  Cpu,
  BarChart3,
  Users,
  MapPin,
  AlertCircle,
  ChevronRight
} from "lucide-react";

// Background Animation Component
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

// Main Home Component (EXACTLY YOUR ORIGINAL CODE)
export default function Home() {
  const [activeMetric, setActiveMetric] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [liveData, setLiveData] = useState({
    healthIndex: 87,
    riskLevel: "Low",
    activeAlerts: 3,
    coverage: "92%"
  });

  // Check mobile and initialize animations
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Live data simulation
    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        healthIndex: Math.max(70, Math.min(98, prev.healthIndex + (Math.random() - 0.5) * 2)),
        activeAlerts: Math.max(1, Math.min(5, prev.activeAlerts + (Math.random() > 0.7 ? 1 : -1)))
      }));
    }, 3000);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(interval);
    };
  }, []);

  const metrics = [
    { icon: <Activity size={20} />, label: "Health Index", value: "87.3", change: "+2.1%", color: "#10b981" },
    { icon: <Shield size={20} />, label: "Risk Level", value: "Low", change: "Stable", color: "#3b82f6" },
    { icon: <TrendingUp size={20} />, label: "Active Cases", value: "142", change: "-4.2%", color: "#8b5cf6" },
    { icon: <Globe size={20} />, label: "Coverage", value: "92%", change: "+1.3%", color: "#f59e0b" },
  ];

  const features = [
    { icon: <Cpu />, title: "AI-Powered Analytics", desc: "Real-time health monitoring" },
    { icon: <BarChart3 />, title: "Predictive Modeling", desc: "Forecast outbreaks 7 days ahead" },
    { icon: <Users />, title: "Community Network", desc: "Connect local health providers" },
    { icon: <MapPin />, title: "Geospatial Tracking", desc: "Pinpoint risk zones accurately" },
  ];

  const alerts = [
    { id: 1, type: "warning", location: "Downtown Sector", message: "Elevated flu activity detected", time: "10 min ago" },
    { id: 2, type: "info", location: "West District", message: "Vaccination drive completed", time: "1 hour ago" },
    { id: 3, type: "success", location: "North Region", message: "Health index improved by 5%", time: "2 hours ago" },
  ];

  return (
    <div className="industrial-dashboard">
      {/* Background Animation Added Here */}
      <BackgroundAnimation />
      
      {/* Header Bar */}
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
            <span>System Online</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="live-badge">
            <div className="live-pulse"></div>
            LIVE DATA
          </div>
          <div className="time-display">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="dashboard-main">
        <div className="hero-section">
          <div className="hero-content">
            <div className="badge-container">
              <span className="industry-badge">LIFEPULSE AI</span>
              <span className="version-badge">v2.4.1</span>
            </div>
            
            <h1 className="hero-title">
              Community Health
              <span className="title-gradient"> Intelligence</span>
              <br />
              <span className="title-sub">Powered by AI</span>
            </h1>
            
            <p className="hero-description">
              Advanced predictive analytics platform for real-time community health monitoring, 
              risk assessment, and intelligent outbreak prevention.
            </p>
            
            {/* Quick Stats Row */}
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
              <a href="/select-role" className="primary-cta">
                <span>Launch Dashboard</span>
                <ChevronRight size={20} />
              </a>
              
              <div className="cta-options">
                <a href="#" className="secondary-cta">
                  <span>View Demo</span>
                </a>
                <a href="#" className="tertiary-cta">
                  <span>Request Access</span>
                </a>
              </div>
            </div>
          </div>
          
          {/* Visual Data Panel */}
          <div className="data-visualization">
            <div className="viz-header">
              <h3>Live Health Pulse</h3>
              <div className="viz-controls">
                <span className="viz-update">Updated just now</span>
              </div>
            </div>
            
            {/* Animated Wave Graph */}
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
            
            {/* Live Alerts */}
            <div className="live-alerts">
              <div className="alerts-header">
                <AlertCircle size={18} />
                <span>Active Alerts</span>
                <span className="alert-count">{liveData.activeAlerts}</span>
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

        {/* Features Grid */}
        <div className="features-section">
          <h2 className="section-title">Platform Capabilities</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
                <div className="feature-line"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">LifePulse AI</span>
              <span className="footer-tagline">Health Intelligence Platform</span>
            </div>
            
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Monitoring</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">256-bit</span>
                <span className="stat-label">Encryption</span>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <span>© 2024 LifePulse AI. All rights reserved.</span>
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