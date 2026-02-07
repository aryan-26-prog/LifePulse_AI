import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  ChevronRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserCheck,
  AlertTriangle,
  Key
} from "lucide-react";
import API from "../api/api";

// Background Animation Component (EXACT SAME AS HOME)
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

export default function Login() {
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMetric, setActiveMetric] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [liveData, setLiveData] = useState({
    healthIndex: 87,
    riskLevel: "Low",
    activeAlerts: 3,
    coverage: "92%"
  });

  // Check mobile and initialize animations (SAME AS HOME)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Live data simulation (SAME AS HOME)
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
    { icon: <Shield size={20} />, label: "Active Users", value: "50K+", change: "Growing", color: "#3b82f6" },
    { icon: <TrendingUp size={20} />, label: "Communities", value: "100+", change: "-4.2%", color: "#8b5cf6" },
    { icon: <Globe size={20} />, label: "Coverage", value: "92%", change: "+1.3%", color: "#f59e0b" },
  ];

  const features = [
    { icon: <Cpu />, title: "AI-Powered Security", desc: "Real-time threat detection" },
    { icon: <BarChart3 />, title: "Smart Analytics", desc: "Personalized dashboards" },
    { icon: <Users />, title: "Community Network", desc: "Connect with verified members" },
    { icon: <MapPin />, title: "Geospatial Access", desc: "Location-based permissions" },
  ];

  const alerts = [
    { id: 1, type: "warning", location: "Security", message: "Always logout from public devices", time: "Just now" },
    { id: 2, type: "success", location: "System", message: "All systems operational", time: "2 min ago" },
    { id: 3, type: "info", location: "Authentication", message: "Use strong passwords", time: "5 min ago" },
  ];

  const login = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { email, password } = e.target;

    try {
      const res = await API.post("/auth/login", {
        email: email.value,
        password: password.value
      });

      const userRole = res.data.user.role;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", userRole);

      if (userRole === "volunteer") {
        localStorage.setItem("volunteerId", res.data.volunteerId);
      }

      /* ⭐ Role Based Redirect */
      if (userRole === "admin") window.location.href = "/admin";
      else if (userRole === "ngo") window.location.href = "/ngo";
      else if (userRole === "volunteer") window.location.href = "/volunteer";

    } catch {
      alert("Invalid credentials or blocked account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="industrial-dashboard">
      {/* Background Animation (SAME AS HOME) */}
      <BackgroundAnimation />
      
      {/* Header Bar (SAME AS HOME) */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
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
            <span>Authentication Portal</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="live-badge">
            <div className="live-pulse"></div>
            SECURE LOGIN
          </div>
          <div className="time-display">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* Main Hero Section (SAME LAYOUT AS HOME) */}
      <main className="dashboard-main">
        <div className="hero-section">
          <div className="hero-content">
            <div className="badge-container">
              <span className="industry-badge">SECURE ACCESS</span>
              <span className="version-badge">v2.4.1</span>
            </div>
            
            <h1 className="hero-title">
              Welcome Back to
              <span className="title-gradient"> LifePulse AI</span>
              <br />
              <span className="title-sub">Secure Authentication</span>
            </h1>
            
            <p className="hero-description">
              Sign in to access your personalized dashboard, community health analytics, 
              and real-time intelligence platform.
            </p>
            
            {/* Live Alerts (SAME AS HOME) */}
            <div className="live-alerts">
              <div className="alerts-header">
                <AlertCircle size={18} />
                <span>System Alerts</span>
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
          
          {/* Right Panel (FORM REPLACES DATA VISUALIZATION) */}
          <div className="data-visualization">
            <div className="viz-header">
              <h3>Secure Login</h3>
              <div className="viz-controls">
                <span className="viz-update" style={{ background: '#10b98120', color: '#10b981' }}>
                  <Shield size={14} />
                  Encrypted
                </span>
              </div>
            </div>
            
            {/* Login Form */}
            <form className="login-form" onSubmit={login}>
              
              {/* Email Field */}
              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} />
                  Email Address
                </label>
                <div className="input-wrapper">
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="Enter your registered email" 
                    required 
                    className="form-input"
                  />
                  <div className="input-icon">
                    <Mail size={18} />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">
                  <Lock size={16} />
                  Password
                </label>
                <div className="input-wrapper">
                  <input 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    required 
                    className="form-input"
                  />
                  <div className="input-icon">
                    <Lock size={18} />
                  </div>
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="primary-cta form-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ChevronRight size={20} />
                  </>
                )}
              </button>

              {/* Register Link */}
              <div className="form-footer">
                <span>New to LifePulse AI?</span>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>
                  Create an Account
                </a>
              </div>
            </form>
          </div>
        </div>

        {/* Features Grid (SAME AS HOME) */}
        <div className="features-section">
          <h2 className="section-title">Platform Features</h2>
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

        {/* Footer (SAME AS HOME) */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">LifePulse AI</span>
              <span className="footer-tagline">Secure Authentication Platform</span>
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
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Back to Home</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}