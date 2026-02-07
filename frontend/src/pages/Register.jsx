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
  User,
  Building,
  Heart,
  HandHeart,
  Mail,
  Lock,
  Phone,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  UserPlus
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

export default function Register() {
  const navigate = useNavigate();
  
  const [role, setRole] = useState("");
  const [ngoRegistrationId, setNgoRegistrationId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [liveData, setLiveData] = useState({
    activeAlerts: 3,
  });

  // Live data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        activeAlerts: Math.max(1, Math.min(5, prev.activeAlerts + (Math.random() > 0.7 ? 1 : -1)))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: <Cpu />, title: "AI-Powered Security", desc: "Real-time threat detection" },
    { icon: <BarChart3 />, title: "Role Analytics", desc: "Track your impact" },
    { icon: <Users />, title: "Community Network", desc: "Connect with verified members" },
    { icon: <MapPin />, title: "Geospatial Verification", desc: "Location-based validation" },
  ];

  const alerts = [
    { id: 1, type: "warning", location: "Security Alert", message: "Use strong password for registration", time: "Just now" },
    { id: 2, type: "info", location: "System", message: "OTP verification required after registration", time: "2 min ago" },
    { id: 3, type: "success", location: "Welcome", message: "Join 50K+ verified users", time: "5 min ago" },
  ];

  const register = async (e) => {
    e.preventDefault();
    
    if (!role) {
      alert("Please select a role");
      return;
    }

    const { name, email, password, phone } = e.target;
    setIsLoading(true);

    try {
      const payload = {
        name: name.value,
        email: email.value,
        password: password.value,
        role
      };

      /* ⭐ Volunteer → Phone */
      if (role === "volunteer") {
        payload.phone = phone.value;
      }

      /* ⭐ NGO → Registration ID */
      if (role === "ngo") {
        payload.ngoRegistrationId = ngoRegistrationId;
      }

      const res = await API.post("/auth/register", payload);

      /* ⭐ OTP verification */
      localStorage.setItem("pendingUser", res.data.userId);

      alert("OTP sent to your email");

      navigate("/verify-otp");

    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = () => {
    switch(role) {
      case 'ngo': return '#3b82f6';
      case 'volunteer': return '#10b981';
      case 'admin': return '#8b5cf6';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="industrial-dashboard">
      {/* Background Animation */}
      <BackgroundAnimation />
      
      {/* Header Bar */}
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
            <span>Registration Portal</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="live-badge">
            <div className="live-pulse"></div>
            SECURE REGISTRATION
          </div>
          <div className="time-display">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* Main Content - Clean Layout */}
      <main className="dashboard-main">
        <div className="register-section">
          {/* Left: Welcome Content */}
          <div className="register-content">
            <div className="badge-container">
              <span className="industry-badge">ACCOUNT CREATION</span>
              <span className="version-badge">v2.4.1</span>
            </div>
            
            <h1 className="hero-title">
              Join the
              <span className="title-gradient"> LifePulse AI</span>
              <br />
              <span className="title-sub">Community</span>
            </h1>
            
            <p className="hero-description">
              Create your account to access real-time community health intelligence, 
              collaborate with verified organizations, and contribute to public health monitoring.
            </p>

            {/* Live Alerts */}
            <div className="live-alerts">
              <div className="alerts-header">
                <AlertCircle size={18} />
                <span>Security Alerts</span>
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
          
          {/* Right: Registration Form Panel */}
          <div className="register-form-panel">
            <div className="panel-header">
              <div className="panel-badge">
                <UserPlus size={18} />
                <span>Create Account</span>
              </div>
              <div className="panel-subtitle">
                Fill in your details to get started
              </div>
            </div>
            
            {/* Registration Form */}
            <form className="auth-form" onSubmit={register}>
              
              {/* Role Selection */}
              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  Select Your Role
                </label>
                <div className="role-selector">
                  {['ngo', 'volunteer', 'admin'].map((r) => (
                    <div 
                      key={r}
                      className={`role-option ${role === r ? 'selected' : ''}`}
                      onClick={() => setRole(r)}
                      style={{
                        borderColor: role === r ? getRoleColor() : 'rgba(255,255,255,0.1)',
                        background: role === r ? `${getRoleColor()}15` : 'rgba(255,255,255,0.03)'
                      }}
                    >
                      {r === 'ngo' && <Heart size={18} />}
                      {r === 'volunteer' && <HandHeart size={18} />}
                      {r === 'admin' && <Building size={18} />}
                      <span className="role-text">{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                      {role === r && <CheckCircle size={16} className="check-icon" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Name Field */}
              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  Full Name
                </label>
                <div className="input-wrapper">
                  <input 
                    name="name" 
                    placeholder="Enter your full name" 
                    required 
                    className="form-input"
                  />
                  <div className="input-icon">
                    <User size={18} />
                  </div>
                </div>
              </div>

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
                    placeholder="Enter your email" 
                    required 
                    className="form-input"
                  />
                  <div className="input-icon">
                    <Mail size={18} />
                  </div>
                </div>
              </div>

              {/* Volunteer Phone */}
              {role === "volunteer" && (
                <div className="form-group">
                  <label className="form-label">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <div className="input-wrapper">
                    <input 
                      name="phone" 
                      placeholder="Enter phone number" 
                      required 
                      className="form-input"
                    />
                    <div className="input-icon">
                      <Phone size={18} />
                    </div>
                  </div>
                </div>
              )}

              {/* NGO Registration ID */}
              {role === "ngo" && (
                <div className="form-group">
                  <label className="form-label">
                    <Key size={16} />
                    NGO Registration ID
                  </label>
                  <div className="input-wrapper">
                    <input 
                      name="ngoRegistrationId"
                      placeholder="Enter registration ID"
                      value={ngoRegistrationId}
                      onChange={(e) => setNgoRegistrationId(e.target.value)}
                      required 
                      className="form-input"
                    />
                    <div className="input-icon">
                      <Key size={18} />
                    </div>
                  </div>
                </div>
              )}

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
                    placeholder="Create secure password" 
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
                <div className="password-hints">
                  <span>• Minimum 8 characters</span>
                  <span>• Include numbers & symbols</span>
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ChevronRight size={20} />
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="auth-footer">
                <span>Already have an account?</span>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                  Sign In Here
                </a>
              </div>
            </form>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-section">
          <h2 className="section-title">Registration Benefits</h2>
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
              <span className="footer-tagline">Secure Registration Portal</span>
            </div>
            
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="stat-number">256-bit</span>
                <span className="stat-label">Encryption</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">GDPR</span>
                <span className="stat-label">Compliant</span>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <span>© 2024 LifePulse AI. All rights reserved.</span>
            <div className="footer-links">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/select-role'); }}>Role Select</a>
              <a href="#">Support</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}