import { useEffect, useState, useRef } from "react";
import { 
  Activity, 
  Shield, 
  TrendingUp, 
  Globe, 
  Users,
  Building,
  Heart,
  ShieldCheck,
  ArrowRight,
  Users2,
  Building2,
  HeartPulse,
  HandHeart
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Background Animation Component (Same as Home)
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

export default function RoleSelect() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const roles = [
    {
      id: 'citizen',
      icon: <Users2 size={28} />,
      title: 'Citizen',
      description: '10-second anonymous health check-in to help monitor community wellness',
      color: '#10b981',
      gradient: 'from-emerald-500 to-emerald-600',
      path: '/citizen/checkin'
    },
    {
      id: 'ngo',
      icon: <HeartPulse size={28} />,
      title: 'NGO / Healthcare',
      description: 'Access community health analytics and coordinate relief efforts',
      color: '#3b82f6',
      gradient: 'from-blue-500 to-blue-600',
      path: '/login?role=ngo'
    },
    {
      id: 'admin',
      icon: <Building2 size={28} />,
      title: 'Government Admin',
      description: 'City-wide health monitoring and risk management dashboard',
      color: '#8b5cf6',
      gradient: 'from-violet-500 to-violet-600',
      path: '/login?role=admin'
    },
    {
      id: 'volunteer',
      icon: <HandHeart size={28} />,
      title: 'Volunteer',
      description: 'Join community health campaigns and support local initiatives',
      color: '#f59e0b',
      gradient: 'from-amber-500 to-amber-600',
      path: '/login?role=volunteer'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Active Users', icon: <Users size={16} /> },
    { value: '100+', label: 'Communities', icon: <Building size={16} /> },
    { value: '24/7', label: 'Monitoring', icon: <Activity size={16} /> },
    { value: '99.9%', label: 'Secure', icon: <ShieldCheck size={16} /> },
  ];

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
            <span>Role Selector</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="live-badge">
            <div className="live-pulse"></div>
            SELECT ROLE
          </div>
          <div className="time-display">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="role-section">
          <div className="role-header">
            <h1 className="hero-title">
              Select Your
              <span className="title-gradient"> Access Role</span>
            </h1>
            
            <p className="hero-description">
              Choose how you want to engage with LifePulse AI. Each role provides different 
              levels of access and functionality tailored to your needs.
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="roles-grid">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`role-card ${selectedRole === role.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedRole(role.id);
                  setTimeout(() => navigate(role.path), 300);
                }}
                onMouseEnter={() => setSelectedRole(role.id)}
                onMouseLeave={() => setSelectedRole(null)}
              >
                <div className="role-card-header">
                  <div 
                    className="role-icon-wrapper"
                    style={{ 
                      background: `linear-gradient(135deg, ${role.color}20, ${role.color}40)`,
                      borderColor: `${role.color}40`
                    }}
                  >
                    <div style={{ color: role.color }}>
                      {role.icon}
                    </div>
                  </div>
                  <div className="role-badge" style={{ background: `${role.color}20`, color: role.color }}>
                    {role.id.toUpperCase()}
                  </div>
                </div>
                
                <div className="role-card-content">
                  <h3 className="role-title">{role.title}</h3>
                  <p className="role-description">{role.description}</p>
                  
                  <div className="role-features">
                    <div className="feature">
                      <Shield size={14} />
                      <span>Secure Access</span>
                    </div>
                    <div className="feature">
                      <TrendingUp size={14} />
                      <span>Real-time Data</span>
                    </div>
                    <div className="feature">
                      <Globe size={14} />
                      <span>Community Network</span>
                    </div>
                  </div>
                </div>
                
                <div className="role-card-footer">
                  <button 
                    className="role-select-btn"
                    style={{ 
                      background: `linear-gradient(90deg, ${role.color}, ${role.color}dd)`,
                      boxShadow: `0 4px 15px ${role.color}40`
                    }}
                  >
                    <span>Select Role</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
                
                <div className="role-glow" style={{ background: role.color }}></div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="instructions-panel">
            <div className="instructions-header">
              <Shield size={20} />
              <h3>Role Security Information</h3>
            </div>
            <div className="instructions-content">
              <div className="instruction">
                <div className="instruction-badge">1</div>
                <div>
                  <strong>Role-Based Access</strong>
                  <p>Each role provides specific permissions and data access levels</p>
                </div>
              </div>
              <div className="instruction">
                <div className="instruction-badge">2</div>
                <div>
                  <strong>Data Privacy</strong>
                  <p>Your data is encrypted and protected according to your role permissions</p>
                </div>
              </div>
              <div className="instruction">
                <div className="instruction-badge">3</div>
                <div>
                  <strong>Community Impact</strong>
                  <p>Your participation helps improve public health intelligence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">LifePulse AI</span>
            <span className="footer-tagline">Role-Based Access Platform</span>
          </div>
          
          <div className="footer-stats">
            <div className="footer-stat">
              <span className="stat-number">4</span>
              <span className="stat-label">Roles</span>
            </div>
            <div className="footer-stat">
              <span className="stat-number">256-bit</span>
              <span className="stat-label">Encryption</span>
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
            <a href="#" onClick={() => navigate('/')}>Back to Home</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}