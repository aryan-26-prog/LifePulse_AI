import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/api";
import socket from "../../utils/sockets";
import {
  Activity,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Shield,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Eye,
  CheckSquare,
  XSquare,
  Image as ImageIcon,
  MessageSquare,
  Phone,
  Award,
  TrendingUp,
  Target,
  BarChart3,
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

export default function CampOperations() {
  const { campId } = useParams();
  const [camp, setCamp] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [closing, setClosing] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState('overview');

  const loadCamp = async () => {
    const res = await API.get(`/ngo/camp/${campId}`);
    setCamp(res.data);
  };

  const loadVolunteers = async () => {
    const res = await API.get("/ngo/volunteers");
    setVolunteers(res.data.data?.filter(v => v.available) || []);
  };

  const loadReports = async () => {
    const res = await API.get(`/work-report/camp/${campId}`);
    setReports(res.data.data || []);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCamp(),
        loadVolunteers(),
        loadReports()
      ]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [campId]);

  // Socket for real-time updates
  useEffect(() => {
    socket.emit("joinNGO");

    const handleNewReport = (data) => {
      if (data.campId === campId) {
        setMessage("📢 New volunteer report submitted");
        loadReports();
      }
    };

    socket.on("newWorkReport", handleNewReport);

    return () => {
      socket.off("newWorkReport", handleNewReport);
    };
  }, [campId]);

  // Toggle volunteer selection
  const toggleVolunteer = (id) => {
    setSelectedVolunteers(prev => 
      prev.includes(id) 
        ? prev.filter(v => v !== id)
        : [...prev, id]
    );
  };

  // Assign volunteers
  const assignVolunteers = async () => {
    if (!selectedVolunteers.length) {
      alert("Please select volunteers to assign");
      return;
    }

    try {
      setAssigning(true);
      const res = await API.post("/ngo/assign-volunteers", {
        campId,
        volunteerIds: selectedVolunteers
      });

      setMessage(`✅ ${res.data.count} volunteers assigned`);
      setSelectedVolunteers([]);
      await loadAllData();
    } catch (error) {
      console.error("Failed to assign volunteers:", error);
    } finally {
      setAssigning(false);
    }
  };

  // Close camp
  const closeCamp = async () => {
    if (!window.confirm("Are you sure you want to close this camp?")) return;

    try {
      setClosing(true);
      await API.post("/ngo/close-camp", { campId });
      await loadCamp();
    } catch (error) {
      console.error("Failed to close camp:", error);
    } finally {
      setClosing(false);
    }
  };

  // Report actions
  const approveReport = async (id) => {
    await API.put(`/work-report/approve/${id}`);
    await loadReports();
  };

  const rejectReport = async (id) => {
    const feedback = prompt("Enter reason for rejection:");
    if (!feedback) return;
    
    await API.put(`/work-report/reject/${id}`, { feedback });
    await loadReports();
  };

  // Get risk color
  const getRiskColor = (risk) => {
    switch(risk) {
      case "SEVERE": return "#dc2626";
      case "HIGH": return "#ef4444";
      case "MEDIUM": return "#f59e0b";
      default: return "#10b981";
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case "ACTIVE": return "#10b981";
      case "CLOSED": return "#64748b";
      case "PENDING": return "#f59e0b";
      default: return "#94a3b8";
    }
  };

  // Calculate stats
  const stats = {
    assignedVolunteers: camp?.volunteerAssigned?.length || 0,
    pendingReports: reports.filter(r => r.status === "PENDING").length,
    approvedReports: reports.filter(r => r.status === "APPROVED").length,
    totalPeopleHelped: reports.reduce((sum, r) => sum + (r.peopleHelped || 0), 0),
    totalHoursWorked: reports.reduce((sum, r) => sum + (r.hoursWorked || 0), 0)
  };

  if (loading) {
    return (
      <div className="industrial-dashboard">
        <BackgroundAnimation />
        <div className="loading-container">
          <div className="loading-spinner">
            <RefreshCw size={32} className="spinning" />
          </div>
          <h2>Loading Camp Operations...</h2>
        </div>
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="industrial-dashboard">
        <BackgroundAnimation />
        <div className="error-container">
          <AlertCircle size={48} />
          <h2>Camp Not Found</h2>
          <p>The requested camp could not be loaded</p>
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
            <span>Camp Operations</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="live-badge">
            <PulseIndicator />
            LIVE OPERATIONS
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
              <span className="industry-badge">CAMP OPERATIONS</span>
              <span className="version-badge">Real-time</span>
            </div>
            
            <h1 className="hero-title">
              Relief Camp
              <span className="title-gradient"> Operations Center</span>
            </h1>
            
            <p className="hero-description">
              Manage volunteer assignments, review work reports, and oversee relief operations 
              in real-time for {camp.area}
            </p>

            {/* Camp Info Card */}
            <div className="camp-info-card">
              <div className="info-header">
                <div className="location">
                  <MapPin size={20} />
                  <h3>{camp.area}</h3>
                </div>
                <div className="status-badges">
                  <span 
                    className="status-badge"
                    style={{ background: getStatusColor(camp.status) }}
                  >
                    {camp.status}
                  </span>
                  <span 
                    className="risk-badge"
                    style={{ background: getRiskColor(camp.riskLevel) }}
                  >
                    {camp.riskLevel} RISK
                  </span>
                </div>
              </div>
              
              <div className="info-stats">
                <StatCard
                  icon={<Users size={20} />}
                  label="Assigned Volunteers"
                  value={stats.assignedVolunteers}
                  color="#3b82f6"
                />
                <StatCard
                  icon={<FileText size={20} />}
                  label="Pending Reports"
                  value={stats.pendingReports}
                  color="#f59e0b"
                />
                <StatCard
                  icon={<Award size={20} />}
                  label="People Helped"
                  value={stats.totalPeopleHelped}
                  color="#10b981"
                />
                <StatCard
                  icon={<Clock size={20} />}
                  label="Hours Worked"
                  value={stats.totalHoursWorked}
                  color="#8b5cf6"
                />
              </div>
            </div>
          </div>
          
          {/* Quick Actions Panel */}
          <div className="actions-panel">
            <div className="panel-header">
              <h3>Quick Actions</h3>
            </div>
            
            <div className="action-buttons">
              {camp.status !== "CLOSED" ? (
                <>
                  <button 
                    className={`action-btn primary ${assigning ? 'loading' : ''}`}
                    onClick={assignVolunteers}
                    disabled={assigning || !selectedVolunteers.length}
                  >
                    {assigning ? (
                      <RefreshCw className="spinning" size={16} />
                    ) : (
                      <Users size={16} />
                    )}
                    <span>
                      Assign {selectedVolunteers.length} Volunteer{selectedVolunteers.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                  
                  <button 
                    className="action-btn warning"
                    onClick={closeCamp}
                    disabled={closing}
                  >
                    {closing ? (
                      <RefreshCw className="spinning" size={16} />
                    ) : (
                      <Lock size={16} />
                    )}
                    <span>Close Camp</span>
                  </button>
                </>
              ) : (
                <div className="camp-closed-notice">
                  <Lock size={24} />
                  <span>This camp has been closed for operations</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs-navigation">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={16} />
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'volunteers' ? 'active' : ''}`}
            onClick={() => setActiveTab('volunteers')}
          >
            <Users size={16} />
            Volunteers
            <span className="tab-badge">{volunteers.length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={16} />
            Reports
            <span className="tab-badge">{reports.length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'assigned' ? 'active' : ''}`}
            onClick={() => setActiveTab('assigned')}
          >
            <Award size={16} />
            Assigned
            <span className="tab-badge">{stats.assignedVolunteers}</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            {/* Message Banner */}
            {message && (
              <div className="message-banner">
                <AlertCircle size={18} />
                <span>{message}</span>
              </div>
            )}

            {/* Volunteers Grid */}
            <div className="volunteers-grid">
              <h3 className="section-title">Available Volunteers</h3>
              <div className="grid">
                {volunteers.map(v => (
                  <div 
                    key={v._id}
                    className={`volunteer-card ${selectedVolunteers.includes(v._id) ? 'selected' : ''}`}
                    onClick={() => toggleVolunteer(v._id)}
                  >
                    <div className="volunteer-check">
                      {selectedVolunteers.includes(v._id) ? (
                        <CheckSquare size={20} className="checked" />
                      ) : (
                        <CheckSquare size={20} />
                      )}
                    </div>
                    <div className="volunteer-info">
                      <div className="volunteer-name">{v.name}</div>
                      <div className="volunteer-contact">
                        <Phone size={14} />
                        {v.phone}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'volunteers' && (
          <div className="tab-content">
            <div className="volunteers-list">
              <h3 className="section-title">All Available Volunteers</h3>
              <div className="list">
                {volunteers.map(v => (
                  <div key={v._id} className="volunteer-item">
                    <div className="volunteer-header">
                      <div className="volunteer-name">{v.name}</div>
                      <div className="volunteer-status">
                        <span className="status-badge available">Available</span>
                      </div>
                    </div>
                    <div className="volunteer-details">
                      <div className="detail">
                        <Phone size={14} />
                        <span>{v.phone}</span>
                      </div>
                      <button 
                        className="select-btn"
                        onClick={() => toggleVolunteer(v._id)}
                      >
                        {selectedVolunteers.includes(v._id) ? "Deselect" : "Select"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="tab-content">
            <div className="reports-section">
              <h3 className="section-title">Volunteer Work Reports</h3>
              
              {reports.length === 0 ? (
                <div className="empty-state">
                  <FileText size={48} />
                  <p>No reports submitted yet</p>
                </div>
              ) : (
                <div className="reports-grid">
                  {reports.map(report => (
                    <div key={report._id} className="report-card">
                      <div className="report-header">
                        <div className="report-volunteer">
                          <Users size={16} />
                          <span>{report.volunteer?.name}</span>
                        </div>
                        <div className={`report-status ${report.status.toLowerCase()}`}>
                          {report.status}
                        </div>
                      </div>
                      
                      <div className="report-content">
                        <p className="report-description">
                          <MessageSquare size={14} />
                          {report.description}
                        </p>
                        
                        <div className="report-metrics">
                          <div className="metric">
                            <Users size={14} />
                            <span>Helped: {report.peopleHelped}</span>
                          </div>
                          <div className="metric">
                            <Clock size={14} />
                            <span>Hours: {report.hoursWorked}</span>
                          </div>
                        </div>
                        
                        {report.images?.length > 0 && (
                          <div className="report-images">
                            <div className="images-header">
                              <ImageIcon size={14} />
                              <span>Evidence Images</span>
                            </div>
                            <div className="image-grid">
                              {report.images.map((img, idx) => (
                                <div key={idx} className="image-preview">
                                  <img 
                                    src={`http://localhost:5000/${img}`}
                                    alt={`Evidence ${idx + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {report.status === "PENDING" && (
                        <div className="report-actions">
                          <button 
                            className="action-btn success"
                            onClick={() => approveReport(report._id)}
                          >
                            <CheckCircle size={16} />
                            Approve
                          </button>
                          <button 
                            className="action-btn danger"
                            onClick={() => rejectReport(report._id)}
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assigned' && (
          <div className="tab-content">
            <div className="assigned-section">
              <h3 className="section-title">Assigned Volunteers</h3>
              
              {camp.volunteerAssigned?.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} />
                  <p>No volunteers assigned yet</p>
                </div>
              ) : (
                <div className="assigned-grid">
                  {camp.volunteerAssigned?.map(v => (
                    <div key={v._id} className="assigned-card">
                      <div className="volunteer-avatar">
                        <Users size={24} />
                      </div>
                      <div className="volunteer-info">
                        <div className="volunteer-name">{v.name}</div>
                        <div className="volunteer-contact">
                          <Phone size={14} />
                          <span>{v.phone}</span>
                        </div>
                      </div>
                      <div className="volunteer-status">
                        <span className="status-badge assigned">Assigned</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer - Same as Home */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">LifePulse AI Operations</span>
              <span className="footer-tagline">Camp Management Platform</span>
            </div>
            
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="stat-number">{camp.volunteerAssigned?.length || 0}</span>
                <span className="stat-label">Volunteers</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">{reports.length}</span>
                <span className="stat-label">Reports</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">{stats.totalPeopleHelped}</span>
                <span className="stat-label">Helped</span>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <span>© 2024 LifePulse AI. Camp Operations for {camp.area}</span>
            <div className="footer-links">
              <span onClick={() => window.location.reload()}>Refresh</span>
              <span>Export</span>
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