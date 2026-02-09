import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import socket from "../../utils/sockets";
import {
  Activity,
  Shield,
  TrendingUp,
  Users,
  MapPin,
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  Target,
  Award,
  ChevronRight,
  Navigation,
  Zap,
  CheckCircle,
  XCircle,
  LogOut,
  User,
  AlertTriangle,
  Heart
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

// Stat Card Component
const StatCard = ({ icon, label, value, color, change }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + '20', color }}>
      {icon}
    </div>
    <div className="stat-content">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
    {change && (
      <div className="stat-change" style={{ color }}>
        {change}
      </div>
    )}
  </div>
);

export default function VolunteerDashboard() {
  const [volunteer, setVolunteer] = useState(null);
  const [assignedCamp, setAssignedCamp] = useState(null);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('camps');
  const [reportSubmitted, setReportSubmitted] = useState(false);


  const volunteerId = localStorage.getItem("volunteerId");
  const navigate = useNavigate();

  // Socket setup
  useEffect(() => {
    if (!volunteerId || volunteerId === "null") return;

    socket.emit("joinVolunteer", volunteerId);

    const approvedListener = async (data) => {
      alert(`✅ Report Approved! XP +${data.xpEarned}`);
      await loadDashboard();
      await loadCamps();
    };


    const rejectedListener = (data) => {
      alert(`❌ Report Rejected: ${data.feedback}`);
    };

    socket.on("reportApproved", approvedListener);
    socket.on("reportRejected", rejectedListener);

    return () => {
      socket.off("reportApproved", approvedListener);
      socket.off("reportRejected", rejectedListener);
    };
  }, [volunteerId]);

  // Load data
  useEffect(() => {
    if (!volunteerId || volunteerId === "null") return;

    loadAll();
  }, [volunteerId]);

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([loadDashboard(), loadCamps()]);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load data:", error);
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
  const res = await API.get(`/volunteers/${volunteerId}/dashboard`);

  setVolunteer(res.data.volunteer);
  setAssignedCamp(res.data.assignedCamp);
  setReportSubmitted(res.data.reportSubmitted); 
};


  const loadCamps = async () => {

  const res = await API.get(
    `/volunteers/active-camps?volunteerId=${volunteerId}`
  );

  setCamps(res.data.data || []);
};


  const joinCamp = async (id) => {
    try {
      await API.put(`/volunteers/${volunteerId}/join`, { campId: id });
      await loadDashboard();
      await loadCamps();
    } catch {
      alert("Unable to join camp");
    }
  };


  const leaveCamp = async () => {
  if (!window.confirm("Are you sure you want to leave this camp?")) return;

  try {
    await API.put(`/volunteers/${volunteerId}/leave`);
    await loadDashboard();
    await loadCamps();
  } catch {
    alert("Unable to leave camp");
  }
};


  // Get risk color
  const getRiskColor = (risk) => {
    switch(risk) {
      case "SEVERE": return "#8b5cf6";
      case "HIGH": return "#ef4444";
      case "MEDIUM": return "#f59e0b";
      default: return "#10b981";
    }
  };

  // Volunteer stats
  const volunteerStats = volunteer ? [
  { icon: <Award size={20} />, label: "XP Points", value: volunteer.xp || "0", color: "#8b5cf6" },

  { icon: <CheckCircle size={20} />, label: "Completed Camps", value: volunteer.completedCamps || "0", color: "#10b981" },

  { icon: <Heart size={20} />, label: "People Helped", value: volunteer.totalPeopleHelped || "0", color: "#ef4444" },

  { icon: <Clock size={20} />, label: "Hours", value: volunteer.totalHours || "0", color: "#3b82f6" },

] : [];


  if (loading) {
    return (
      <div className="industrial-dashboard">
        <BackgroundAnimation />
        <div className="loading-container">
          <div className="loading-spinner">
            <RefreshCw size={32} className="spinning" />
          </div>
          <h2>Loading Volunteer Dashboard...</h2>
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
              <span className="logo-sub">Volunteer</span>
            </div>
          </div>
          <div className="status-indicator">
            <div className="status-dot active"></div>
            <span>Volunteer Portal Online</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="live-badge">
            <PulseIndicator />
            LIVE
          </div>
          <button 
            onClick={() => navigate("/volunteer/profile")}
            className="profile-btn"
          >
            <User size={16} />
            Profile
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
              <span className="industry-badge">VOLUNTEER PORTAL</span>
              <span className="version-badge">v2.4.1</span>
            </div>
            
            <h1 className="hero-title">
              Volunteer
              <span className="title-gradient"> Control Center</span>
            </h1>
            
            <p className="hero-description">
              Join relief efforts, submit work reports, and track your humanitarian impact in real-time.
              {volunteer && ` Welcome back, ${volunteer.name}!`}
            </p>
            
            {/* Volunteer Stats */}
            <div className="quick-stats">
              {volunteerStats.map((stat, index) => (
                <StatCard
                  key={index}
                  icon={stat.icon}
                  label={stat.label}
                  value={stat.value}
                  color={stat.color}
                  change={stat.change}
                />
              ))}
            </div>
          </div>
          
          {/* Assignment Panel */}
<div className="assignment-panel">

  <div className="panel-header">
    <h3>Current Assignment</h3>
  </div>

  <div className="panel-content">

    {assignedCamp ? (

      <div className="assigned-camp">

        {/* Camp Header */}
        <div className="camp-header">
          <MapPin size={20} />
          <div>
            <h4>{assignedCamp.area}</h4>

            <div
              className="risk-badge"
              style={{ background: getRiskColor(assignedCamp.riskLevel) }}
            >
              {assignedCamp.riskLevel} RISK
            </div>

          </div>
        </div>


        {/* Camp Details */}
        <div className="camp-details">

          <div className="detail">
            <Users size={16} />
            <span>{assignedCamp.volunteersCount || "0"} Volunteers</span>
          </div>

          <div className="detail">
            <AlertTriangle size={16} />
            <span>Priority: {assignedCamp.riskLevel}</span>
          </div>

        </div>


        {/* Camp Actions */}
        <div className="camp-actions">

          {/* ⭐ REPORT BUTTON CONDITION */}
          {!reportSubmitted ? (

            <button
              className="action-btn primary"
              onClick={() => navigate(`/volunteer/report/${assignedCamp._id}`)}
            >
              <Zap size={16} />
              Submit Work Report
              <ChevronRight size={16} />
            </button>

          ) : (

            <div className="report-submitted-badge">
              <CheckCircle size={16} />
              Report Already Submitted
            </div>

          )}


          {/* Leave Camp */}
          <button
            className="action-btn outline"
            onClick={leaveCamp}
          >
            <LogOut size={16} />
            Leave Camp
          </button>

        </div>

      </div>

    ) : (

      <div className="no-assignment">

        <div className="status-icon">
          <CheckCircle size={32} />
        </div>

        <h4>Available for Deployment</h4>
        <p>You are not currently assigned to any relief camp</p>
      </div>

    )}

  </div>
</div>

        </div>

        {/* Tab Content */}
        {activeTab === 'camps' && (
          <div className="tab-content">
            <h3 className="section-title">Available Relief Camps</h3>
            
            <div className="camps-grid">
              {camps.map(camp => (
                <div 
                  key={camp.id}
                  className="camp-card"
                  style={{ borderLeft: `4px solid ${getRiskColor(camp.riskLevel)}` }}
                >
                  <div className="camp-header">
                    <div className="location">
                      <MapPin size={18} />
                      <h4>{camp.area}</h4>
                    </div>
                    <div 
                      className="camp-risk"
                      style={{ background: getRiskColor(camp.riskLevel) }}
                    >
                      {camp.riskLevel}
                    </div>
                  </div>
                  
                  <div className="camp-details">
                    <div className="detail">
                      <Users size={16} />
                      <span>{camp.volunteersCount || "0"} Volunteers</span>
                    </div>
                    <div className="detail">
                      <Target size={16} />
                      <span>Priority Response</span>
                    </div>
                  </div>
                  
                  <div className="camp-description">
                    <AlertCircle size={14} />
                    <span>Urgent relief efforts needed in this area</span>
                  </div>
                  
                  {!assignedCamp && (
                    <button 
                      className="camp-join-btn"
                      onClick={() => joinCamp(camp.id)}
                    >
                      <Users size={16} />
                      Join Relief Camp
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && volunteer && (
          <div className="tab-content">
            <h3 className="section-title">My Activity</h3>
            
            <div className="activity-stats">
              <div className="stat-card large">
                <div className="stat-icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
                  <Award size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{volunteer.xp || "0"}</div>
                  <div className="stat-label">Total XP Points</div>
                  <div className="stat-subtitle">Earned through humanitarian work</div>
                </div>
              </div>
              
              <div className="activity-grid">
                <div className="activity-item">
                  <div className="activity-icon" style={{ background: '#10b98120', color: '#10b981' }}>
                    <CheckCircle size={20} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">Reports Submitted</div>
                    <div className="activity-value">{volunteer.reportsSubmitted || "0"}</div>
                  </div>
                </div>
                
                <div className="activity-item">
                  <div className="activity-icon" style={{ background: '#ef444420', color: '#ef4444' }}>
                    <Heart size={20} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">People Helped</div>
                    <div className="activity-value">{volunteer.peopleHelped || "0"}</div>
                  </div>
                </div>
                
                <div className="activity-item">
                  <div className="activity-icon" style={{ background: '#3b82f620', color: '#3b82f6' }}>
                    <Clock size={20} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">Hours Worked</div>
                    <div className="activity-value">{volunteer.hoursWorked || "0"}</div>
                  </div>
                </div>
                
                <div className="activity-item">
                  <div className="activity-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                    <TrendingUp size={20} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">Rank</div>
                    <div className="activity-value">#{(volunteer.xp || 0) > 100 ? "Expert" : "Beginner"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="tab-content">
            <h3 className="section-title">Rewards & Recognition</h3>
            
            <div className="rewards-grid">
              <div className="reward-card">
                <div className="reward-icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
                  <Award size={24} />
                </div>
                <h4>XP Points</h4>
                <p>Earn XP for every approved work report</p>
                <div className="reward-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${Math.min(100, ((volunteer?.xp || 0) / 1000) * 100)}%` }}
                    />
                  </div>
                  <span>{volunteer?.xp || "0"} / 1000 XP</span>
                </div>
              </div>
              
              <div className="reward-card">
                <div className="reward-icon" style={{ background: '#ef444420', color: '#ef4444' }}>
                  <Heart size={24} />
                </div>
                <h4>Humanitarian Impact</h4>
                <p>Track lives impacted through your work</p>
                <div className="impact-count">
                  <span className="count-value">{volunteer?.peopleHelped || "0"}</span>
                  <span className="count-label">Lives Helped</span>
                </div>
              </div>
              
              <div className="reward-card">
                <div className="reward-icon" style={{ background: '#10b98120', color: '#10b981' }}>
                  <CheckCircle size={24} />
                </div>
                <h4>Certifications</h4>
                <p>Earn badges for your humanitarian work</p>
                <div className="badges">
                  <span className="badge">First Report</span>
                  <span className="badge">50+ Helped</span>
                  <span className="badge">100+ Hours</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer - Same as Home */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">LifePulse Volunteer</span>
              <span className="footer-tagline">Humanitarian Impact Platform</span>
            </div>
            
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="stat-number">{camps.length}</span>
                <span className="stat-label">Camps</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">{volunteer?.xp || "0"}</span>
                <span className="stat-label">Your XP</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <span>© 2024 LifePulse AI. Volunteer Engagement Platform.</span>
            <div className="footer-links">
              <span onClick={() => navigate('/volunteer/dashboard')}>Dashboard</span>
              <span onClick={() => navigate('/volunteer/profile')}>Profile</span>
              <span>Help</span>
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