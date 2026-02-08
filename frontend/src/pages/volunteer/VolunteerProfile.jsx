import { useEffect, useState } from "react";
import API from "../../api/api";
import "../../styles/dashboard.css";
import socket from "../../utils/sockets";
import { 
  User, 
  Award, 
  Target, 
  BarChart3, 
  Clock, 
  Users as UsersIcon,
  Shield,
  Activity,
  TrendingUp,
  Star,
  MapPin,
  CheckCircle,
  XCircle,
  Zap,
  Trophy,
  Medal,
  ChevronRight,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { useRef } from "react";

// Background Animation Component
const BackgroundAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
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

export default function VolunteerProfile() {
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [volunteerId, setVolunteerId] = useState(null);
  const [liveNotifications, setLiveNotifications] = useState([]);

  // Safely get volunteerId from localStorage
  useEffect(() => {
    const id = localStorage.getItem("volunteerId");
    console.log("Retrieved volunteerId from localStorage:", id); // Debug log
    
    if (id && id !== "null" && id !== "undefined") {
      setVolunteerId(id);
    } else {
      setError("No volunteer ID found. Please log in again.");
      setLoading(false);
    }
  }, []);

  // Load profile when volunteerId is available
  useEffect(() => {
    if (!volunteerId) return;

    loadProfile();
  }, [volunteerId]);

  const loadProfile = async () => {
    try {
      console.log("Loading profile for volunteerId:", volunteerId); // Debug log
      
      const res = await API.get(`/volunteers/${volunteerId}/dashboard`);
      console.log("Profile loaded:", res.data); // Debug log
      
      setVolunteer(res.data.volunteer);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load profile. Please try again.");
      setLoading(false);
    }
  };

  /* ================= SOCKET REALTIME ================= */
  useEffect(() => {
    if (!volunteerId) return;

    socket.emit("joinRoom", volunteerId);

    socket.on("reportApproved", (data) => {
      const notification = {
        id: Date.now(),
        type: "success",
        title: "🎉 Mission Accomplished!",
        message: `Your report has been approved! XP +${data.xpEarned}`,
        time: "Just now"
      };
      
      setLiveNotifications(prev => [notification, ...prev.slice(0, 2)]);
      loadProfile();
    });

    socket.on("reportRejected", (data) => {
      const notification = {
        id: Date.now(),
        type: "warning",
        title: "⚠️ Report Needs Attention",
        message: data.feedback || "Please review and resubmit",
        time: "Just now"
      };
      
      setLiveNotifications(prev => [notification, ...prev.slice(0, 2)]);
    });

    return () => {
      socket.off("reportApproved");
      socket.off("reportRejected");
    };
  }, [volunteerId]);

  // Loading state
  if (loading) {
    return (
      <div className="industrial-dashboard">
        <BackgroundAnimation />
        <div className="loading-state">
          <div className="loading-pulse"></div>
          <span>Loading Profile...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="industrial-dashboard">
        <BackgroundAnimation />
        <div className="error-state">
          <AlertTriangle size={48} />
          <h3>Profile Unavailable</h3>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => {
              const id = localStorage.getItem("volunteerId");
              if (id && id !== "null") {
                setVolunteerId(id);
                setLoading(true);
                setError(null);
              } else {
                window.location.href = "/login";
              }
            }}
          >
            <Loader2 size={18} />
            <span>Retry or Login</span>
          </button>
        </div>
      </div>
    );
  }

  // If volunteer data is still not loaded
  if (!volunteer) {
    return (
      <div className="industrial-dashboard">
        <BackgroundAnimation />
        <div className="loading-state">
          <div className="loading-pulse"></div>
          <span>Loading Volunteer Data...</span>
        </div>
      </div>
    );
  }

  /* ===== XP PROGRESS ===== */
  const nextLevelXP = 200;
  const progress = Math.min(((volunteer.xp || 0) / nextLevelXP) * 100, 100);
  const levelNames = ["Rookie", "Explorer", "Hero", "Champion", "Legend"];
  const currentLevel = levelNames[Math.min(volunteer.level || 0, levelNames.length - 1)];

  const stats = [
    { icon: <Target size={20} />, label: "Completed Camps", value: volunteer.completedCamps || 0, color: "#3b82f6" },
    { icon: <UsersIcon size={20} />, label: "People Helped", value: volunteer.totalPeopleHelped || 0, color: "#10b981" },
    { icon: <Clock size={20} />, label: "Hours Served", value: volunteer.totalHours || 0, color: "#8b5cf6" },
    { icon: <Trophy size={20} />, label: "Badges", value: volunteer.badges?.length || 0, color: "#f59e0b" },
  ];

  return (
    <div className="industrial-dashboard">
      <BackgroundAnimation />
      
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <User size={24} />
            </div>
            <div className="logo-text">
              <span className="logo-main">{volunteer.name || "Volunteer"}</span>
              <span className="logo-sub">ID: {volunteerId?.slice(-6) || "N/A"}</span>
            </div>
          </div>
          <div className="status-indicator">
            <div className={`status-dot ${volunteer.available ? 'active' : 'deployed'}`}></div>
            <span>{volunteer.available ? "Available for Missions" : "Currently Deployed"}</span>
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
          {/* Left Profile Panel */}
          <div className="hero-content">
            <div className="badge-container">
              <span className="industry-badge">VOLUNTEER PROFILE</span>
              <span className="version-badge">Level {volunteer.level || 1}</span>
            </div>
            
            <h1 className="hero-title">
              Operational
              <span className="title-gradient"> Status</span>
              <br />
              <span className="title-sub">{currentLevel} Volunteer</span>
            </h1>
            
            {/* XP Progress Bar */}
            <div className="xp-progress">
              <div className="xp-header">
                <span className="xp-label">
                  <Star size={16} />
                  Experience Points
                </span>
                <span className="xp-value">{volunteer.xp || 0} / {nextLevelXP} XP</span>
              </div>
              <div className="xp-bar">
                <div 
                  className="xp-fill"
                  style={{ width: `${progress}%` }}
                >
                  <div className="xp-glow"></div>
                </div>
                <div className="xp-marker">
                  <div className="xp-marker-dot"></div>
                  <span>Next Level</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="quick-stat"
                >
                  <div className="stat-icon" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="stat-details">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                  <div className="stat-change">+{Math.floor(stat.value * 0.1)}</div>
                </div>
              ))}
            </div>

            {/* Contact Info */}
            <div className="contact-card">
              <h3 className="contact-title">
                <User size={20} />
                Operator Details
              </h3>
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-label">Phone</span>
                  <span className="contact-value">{volunteer.phone || "Not Provided"}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Status</span>
                  <span className={`status-badge ${volunteer.available ? 'available' : 'deployed'}`}>
                    {volunteer.available ? "Standby" : "On Mission"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Mission Panel */}
          <div className="data-visualization">
            <div className="viz-header">
              <h3>Current Deployment</h3>
              <div className="viz-controls">
                {volunteer.assignedCamp ? (
                  <span className="viz-update">Active Mission</span>
                ) : (
                  <span className="viz-update">Awaiting Assignment</span>
                )}
              </div>
            </div>
            
            {/* Mission Card */}
            {volunteer.assignedCamp ? (
              <div className="mission-card active">
                <div className="mission-header">
                  <MapPin size={20} />
                  <div className="mission-title">
                    <h4>{volunteer.assignedCamp.area}</h4>
                    <span className="mission-id">CAMP-{volunteer.assignedCamp.id?.slice(-6)}</span>
                  </div>
                  <div className={`risk-badge risk-${volunteer.assignedCamp.riskLevel?.toLowerCase()}`}>
                    {volunteer.assignedCamp.riskLevel}
                  </div>
                </div>
                
                <div className="mission-details">
                  <div className="mission-stat">
                    <Shield size={16} />
                    <span>Status: {volunteer.assignedCamp.status}</span>
                  </div>
                  <div className="mission-stat">
                    <Activity size={16} />
                    <span>Health Index: {Math.floor(Math.random() * 40) + 60}%</span>
                  </div>
                  <div className="mission-stat">
                    <TrendingUp size={16} />
                    <span>Priority: High</span>
                  </div>
                </div>
                
                <button className="mission-report-btn">
                  <ChevronRight size={18} />
                  <span>Submit Report</span>
                </button>
              </div>
            ) : (
              <div className="mission-card inactive">
                <div className="mission-header">
                  <Target size={20} />
                  <div className="mission-title">
                    <h4>No Active Mission</h4>
                    <span className="mission-id">Standby Mode</span>
                  </div>
                </div>
                <p className="mission-awaiting">
                  You are currently on standby. New assignments will appear here automatically.
                </p>
                <button className="mission-scan-btn">
                  <Zap size={18} />
                  <span>Scan for Available Missions</span>
                </button>
              </div>
            )}
            
            {/* Live Notifications */}
            <div className="live-alerts">
              <div className="alerts-header">
                <Activity size={18} />
                <span>Real-time Updates</span>
                {liveNotifications.length > 0 && (
                  <span className="alert-count">{liveNotifications.length}</span>
                )}
              </div>
              <div className="alert-list">
                {liveNotifications.length > 0 ? (
                  liveNotifications.map(notif => (
                    <div key={notif.id} className={`alert-item ${notif.type}`}>
                      <div className="alert-icon">
                        {notif.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      </div>
                      <div className="alert-content">
                        <div className="alert-location">{notif.title}</div>
                        <div className="alert-message">{notif.message}</div>
                      </div>
                      <div className="alert-time">{notif.time}</div>
                    </div>
                  ))
                ) : (
                  <div className="alert-item info">
                    <div className="alert-icon">
                      <Activity size={16} />
                    </div>
                    <div className="alert-content">
                      <div className="alert-location">System Active</div>
                      <div className="alert-message">No recent notifications</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Badges Grid */}
            <div className="badges-section">
              <h3 className="section-title">
                <Award size={20} />
                Achievement Gallery
              </h3>
              {volunteer.badges?.length > 0 ? (
                <div className="badges-grid">
                  {volunteer.badges.map((badge, index) => (
                    <div key={index} className="badge-card">
                      <div className="badge-icon" style={{ fontSize: "32px" }}>
                        {badge.icon}
                      </div>
                      <div className="badge-content">
                        <h4>{badge.name}</h4>
                        <p>{badge.description}</p>
                      </div>
                      <div className="badge-glow"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-badges">
                  <Medal size={48} />
                  <p>No badges earned yet. Complete your first mission!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">Volunteer Network</span>
              <span className="footer-tagline">Operational since {new Date().getFullYear() - 1}</span>
            </div>
            
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="stat-number">{volunteer.xp || 0}</span>
                <span className="stat-label">Total XP</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">{volunteer.level || 1}</span>
                <span className="stat-label">Level</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}