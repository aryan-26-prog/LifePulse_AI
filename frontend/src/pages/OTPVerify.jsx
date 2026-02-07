import { useState, useEffect, useRef } from "react";
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
  Key,
  Mail,
  Lock,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import API from "../api/api";

// Background Animation Component (SAME AS HOME)
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

export default function OTPVerify() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [activeMetric, setActiveMetric] = useState(0);
  const navigate = useNavigate();

  const userId = localStorage.getItem("pendingUser");

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  // Live data simulation (SAME AS HOME)
  useEffect(() => {
    const interval = setInterval(() => {
      // Just for visual consistency
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { icon: <Activity size={20} />, label: "Security Level", value: "High", change: "Active", color: "#10b981" },
    { icon: <Shield size={20} />, label: "Encryption", value: "256-bit", change: "Secure", color: "#3b82f6" },
    { icon: <TrendingUp size={20} />, label: "Verification", value: "OTP", change: "Required", color: "#8b5cf6" },
    { icon: <Globe size={20} />, label: "Coverage", value: "Global", change: "+1.3%", color: "#f59e0b" },
  ];

  const features = [
    { icon: <Cpu />, title: "AI-Powered Security", desc: "Real-time threat detection" },
    { icon: <BarChart3 />, title: "Smart Verification", desc: "One-time password system" },
    { icon: <Users />, title: "Secure Community", desc: "Verified members only" },
    { icon: <MapPin />, title: "Geospatial Auth", desc: "Location-based security" },
  ];

  const alerts = [
    { id: 1, type: "warning", location: "Security Alert", message: "OTP expires in 5 minutes", time: "Just now" },
    { id: 2, type: "info", location: "System", message: "Check your email for OTP", time: "1 min ago" },
    { id: 3, type: "success", location: "Verification", message: "Secure authentication active", time: "2 min ago" },
  ];

  const verify = async () => {
    if (!otp) {
      alert("Please enter OTP");
      return;
    }

    setIsLoading(true);

    try {
      await API.post("/auth/verify-otp", {
        userId,
        otp
      });

      alert("Email verified successfully!");
      localStorage.removeItem("pendingUser");
      navigate("/login");

    } catch {
      alert("Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
            <span>OTP Verification</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="live-badge">
            <div className="live-pulse"></div>
            SECURE VERIFICATION
          </div>
          <div className="time-display">
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="hero-section">
          {/* Left Content */}
          <div className="hero-content">
            <div className="badge-container">
              <span className="industry-badge">EMAIL VERIFICATION</span>
              <span className="version-badge">v2.4.1</span>
            </div>
            
            <h1 className="hero-title">
              Verify Your
              <span className="title-gradient"> Email</span>
              <br />
              <span className="title-sub">One-Time Password</span>
            </h1>
            
            <p className="hero-description">
              Enter the 6-digit verification code sent to your email address 
              to complete your account registration and secure access.
            </p>
            
            {/* Quick Stats Row (SAME AS HOME) */}
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
          </div>
          
          {/* Right: OTP Form Panel */}
          <div className="data-visualization">
            <div className="viz-header">
              <h3>OTP Verification</h3>
              <div className="viz-controls">
                <span className="viz-update" style={{ background: '#10b98120', color: '#10b981' }}>
                  <Clock size={14} />
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            
            {/* OTP Form */}
            <div className="otp-form">
              <div className="otp-header">
                <div className="otp-icon">
                  <Key size={32} />
                </div>
                <h4>Enter Verification Code</h4>
                <p>Check your email for the 6-digit code</p>
              </div>
              
              <div className="otp-input-container">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                  }}
                  className="otp-input"
                  maxLength={6}
                />
                <div className="input-icon">
                  <Key size={18} />
                </div>
              </div>
              
              <div className="otp-info">
                <div className="info-item">
                  <CheckCircle size={16} />
                  <span>6-digit code sent to your email</span>
                </div>
                <div className="info-item">
                  <Clock size={16} />
                  <span>Expires in {formatTime(timeLeft)}</span>
                </div>
                <div className="info-item">
                  <Shield size={16} />
                  <span>Secure one-time verification</span>
                </div>
              </div>

              <button 
                onClick={verify}
                className="primary-cta form-submit"
                disabled={isLoading || !otp || otp.length < 6}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <span>Verify OTP</span>
                    <CheckCircle size={20} />
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="form-footer">
                <span>Already verified?</span>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                  Sign In Here
                </a>
              </div>
            </div>
            
            {/* Live Alerts (SAME AS HOME) */}
            <div className="live-alerts">
              <div className="alerts-header">
                <AlertCircle size={18} />
                <span>Security Alerts</span>
                <span className="alert-count">3</span>
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

        {/* Features Grid (SAME AS HOME) */}
        <div className="features-section">
          <h2 className="section-title">Security Features</h2>
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
              <span className="footer-tagline">Secure OTP Verification</span>
            </div>
            
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="stat-number">256-bit</span>
                <span className="stat-label">Encryption</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">5 min</span>
                <span className="stat-label">OTP Expiry</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Success Rate</span>
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