import { useEffect, useState, useRef } from "react";
import API from "../../api/api";
import { 
  Building2, 
  Mail, 
  Shield, 
  AlertCircle,
  ChevronRight,
  Activity,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Filter,
  Download,
  MoreVertical
} from "lucide-react";

// Background Animation Component (Same as Home Page)
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

// Main NGO Management Component
export default function NGOManagement() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    verified: 0
  });

  // Fetch NGOs
  const fetchNGOs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/ngos");
      setNgos(res.data.data);
      
      // Calculate statistics
      const data = res.data.data;
      setStats({
        total: data.length,
        active: data.filter(n => !n.isBlocked).length,
        blocked: data.filter(n => n.isBlocked).length,
        verified: data.filter(n => n.isVerified).length
      });
    } catch (err) {
      console.error("NGO fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNGOs();
  }, []);

  // Toggle block
  const toggleBlock = async (id) => {
    try {
      setProcessingId(id);
      await API.put(`/admin/ngo/${id}/block`);
      fetchNGOs();
    } catch (err) {
      console.error("Block error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Filter NGOs based on search and status
  const filteredNGOs = ngos.filter(ngo => {
    const matchesSearch = 
      ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ngo.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "active" && !ngo.isBlocked) ||
      (filterStatus === "blocked" && ngo.isBlocked);
    
    return matchesSearch && matchesStatus;
  });

  // Stats cards data
  const statsCards = [
    { 
      icon: <Building2 size={20} />, 
      label: "Total NGOs", 
      value: stats.total, 
      change: "+12.5%", 
      color: "#3b82f6" 
    },
    { 
      icon: <CheckCircle size={20} />, 
      label: "Active", 
      value: stats.active, 
      change: "+8.2%", 
      color: "#10b981" 
    },
    { 
      icon: <XCircle size={20} />, 
      label: "Blocked", 
      value: stats.blocked, 
      change: "-3.1%", 
      color: "#ef4444" 
    },
    { 
      icon: <Shield size={20} />, 
      label: "Verified", 
      value: stats.verified, 
      change: "+5.7%", 
      color: "#8b5cf6" 
    },
  ];

  return (
    <div className="industrial-dashboard">
      {/* Background Animation */}
      <BackgroundAnimation />
      
      {/* Header Bar */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <Building2 size={24} />
            </div>
            <div className="logo-text">
              <span className="logo-main">NGO Manager</span>
              <span className="logo-sub">Admin</span>
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
            LIVE MONITORING
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
              <span className="industry-badge">ORGANIZATION MANAGEMENT</span>
              <span className="version-badge">v2.4.1</span>
            </div>
            
            <h1 className="hero-title">
              NGO Management
              <span className="title-gradient"> Dashboard</span>
              <br />
              <span className="title-sub">Administrative Control Panel</span>
            </h1>
            
            <p className="hero-description">
              Monitor, manage, and regulate all registered non-governmental organizations.
              Real-time status tracking and administrative controls.
            </p>
            
            {/* Quick Stats Row */}
            <div className="quick-stats">
              {statsCards.map((stat, index) => (
                <div key={index} className="quick-stat">
                  <div className="stat-icon" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="stat-details">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                  <div className="stat-change">{stat.change}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Control Panel */}
          <div className="data-visualization">
            <div className="viz-header">
              <h3>Administrative Controls</h3>
              <div className="viz-controls">
                <span className="viz-update">Real-time monitoring</span>
              </div>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="control-panel">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search NGOs by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-group">
                <div className="filter-select">
                  <Filter size={16} />
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="status-filter"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="blocked">Blocked Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NGO Management Table */}
        <div className="management-section">
          <div className="section-header">
            <h2 className="section-title">Registered Organizations</h2>
            <div className="section-actions">
              <span className="record-count">{filteredNGOs.length} organizations</span>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <Loader2 className="loading-spinner" size={32} />
              <p>Loading NGO data...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="industrial-table">
                <thead>
                  <tr>
                    <th>
                      <div className="table-header-cell">
                        <Building2 size={16} />
                        <span>Organization</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header-cell">
                        <Mail size={16} />
                        <span>Contact</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header-cell">
                        <Activity size={16} />
                        <span>Status</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header-cell">
                        <Shield size={16} />
                        <span>Actions</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNGOs.map((ngo) => (
                    <tr key={ngo._id} className="table-row">
                      <td>
                        <div className="org-cell">
                          <div className="org-avatar">
                            {ngo.name.charAt(0)}
                          </div>
                          <div className="org-info">
                            <div className="org-name">{ngo.name}</div>
                            <div className="org-id">ID: {ngo._id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-cell">
                          <div className="contact-email">{ngo.email}</div>
                          <div className="contact-phone">{ngo.phone || "No phone"}</div>
                        </div>
                      </td>
                      <td>
                        <div className={`status-cell ${ngo.isBlocked ? 'blocked' : 'active'}`}>
                          <div className="status-indicator">
                            <div className={`status-dot ${ngo.isBlocked ? 'inactive' : 'active'}`}></div>
                            {ngo.isBlocked ? (
                              <>
                                <XCircle size={14} />
                                <span>Blocked</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle size={14} />
                                <span>Active</span>
                              </>
                            )}
                          </div>
                          <div className="status-date">
                            Last active: {new Date(ngo.updatedAt || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="action-cell">
                          <button
                            onClick={() => toggleBlock(ngo._id)}
                            disabled={processingId === ngo._id}
                            className={`action-btn ${ngo.isBlocked ? 'unblock' : 'block'}`}
                          >
                            {processingId === ngo._id ? (
                              <>
                                <Loader2 className="spinner" size={14} />
                                <span>Processing...</span>
                              </>
                            ) : ngo.isBlocked ? (
                              <>
                                <CheckCircle size={14} />
                                <span>Unblock</span>
                              </>
                            ) : (
                              <>
                                <XCircle size={14} />
                                <span>Block</span>
                              </>
                            )}
                          </button>
                          
                          <button className="more-actions">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredNGOs.length === 0 && (
                <div className="empty-state">
                  <AlertCircle size={48} />
                  <h3>No NGOs found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">NGO Management System</span>
              <span className="footer-tagline">Administrative Control Panel</span>
            </div>
            
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total NGOs</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">{stats.active}</span>
                <span className="stat-label">Active</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Monitoring</span>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <span>© 2024 NGO Management System. All rights reserved.</span>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Documentation</a>
            </div>
          </div>
        </footer>
      </main>

      <style >{`
        .industrial-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #e2e8f0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          overflow-x: hidden;
        }

        /* Header Styles */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          backdrop-filter: blur(10px);
          background: rgba(15, 23, 42, 0.8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-main {
          font-size: 1.25rem;
          font-weight: 700;
          background: linear-gradient(135deg, #e2e8f0, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-sub {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
        }

        .status-dot.active {
          background: #10b981;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .live-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .live-pulse {
          width: 6px;
          height: 6px;
          background: #ef4444;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        .time-display {
          font-size: 1.25rem;
          font-weight: 600;
          background: linear-gradient(135deg, #e2e8f0, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Main Content Styles */
        .dashboard-main {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .hero-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        @media (max-width: 1024px) {
          .hero-section {
            grid-template-columns: 1fr;
          }
        }

        .hero-content {
          padding: 2rem;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .badge-container {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .industry-badge {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .version-badge {
          background: rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #e2e8f0, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .title-gradient {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .title-sub {
          font-size: 1.25rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .hero-description {
          font-size: 1rem;
          line-height: 1.6;
          color: #cbd5e1;
          margin-bottom: 2rem;
        }

        /* Quick Stats */
        .quick-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        @media (max-width: 640px) {
          .quick-stats {
            grid-template-columns: 1fr;
          }
        }

        .quick-stat {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .quick-stat:hover {
          border-color: rgba(59, 130, 246, 0.5);
          transform: translateY(-2px);
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-details {
          flex: 1;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .stat-change {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        /* Control Panel */
        .data-visualization {
          padding: 2rem;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .viz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .viz-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: white;
        }

        .viz-update {
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .control-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.75rem 1rem;
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 0.875rem;
          outline: none;
        }

        .search-input::placeholder {
          color: #64748b;
        }

        .filter-group {
          display: flex;
          gap: 1rem;
        }

        .filter-select {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.75rem 1rem;
        }

        .status-filter {
          background: transparent;
          border: none;
          color: white;
          font-size: 0.875rem;
          outline: none;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 0.75rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        /* Management Section */
        .management-section {
          margin-top: 3rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }

        .record-count {
          font-size: 0.875rem;
          color: #94a3b8;
          background: rgba(30, 41, 59, 0.8);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Table Styles */
        .table-container {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          overflow: hidden;
        }

        .industrial-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .industrial-table thead {
          background: rgba(30, 41, 59, 0.8);
        }

        .industrial-table th {
          padding: 1rem 1.5rem;
          text-align: left;
          font-size: 0.875rem;
          font-weight: 600;
          color: #94a3b8;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .table-header-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .table-row {
          transition: all 0.3s ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-row:hover {
          background: rgba(59, 130, 246, 0.05);
        }

        .industrial-table td {
          padding: 1rem 1.5rem;
        }

        /* Cell Styles */
        .org-cell {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .org-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          font-size: 1rem;
        }

        .org-info {
          display: flex;
          flex-direction: column;
        }

        .org-name {
          font-weight: 600;
          color: white;
        }

        .org-id {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .contact-cell {
          display: flex;
          flex-direction: column;
        }

        .contact-email {
          color: white;
          font-weight: 500;
        }

        .contact-phone {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .status-cell {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .status-cell.active {
          color: #10b981;
        }

        .status-cell.blocked {
          color: #ef4444;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-dot.active {
          background: #10b981;
        }

        .status-dot.inactive {
          background: #ef4444;
        }

        .status-date {
          font-size: 0.75rem;
          color: #64748b;
        }

        .action-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn.block {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .action-btn.block:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-2px);
        }

        .action-btn.unblock {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .action-btn.unblock:hover:not(:disabled) {
          background: rgba(16, 185, 129, 0.2);
          transform: translateY(-2px);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .more-actions {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .more-actions:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        /* Loading and Empty States */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: #94a3b8;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: #94a3b8;
          text-align: center;
        }

        .empty-state h3 {
          color: #e2e8f0;
          margin: 1rem 0 0.5rem;
        }

        /* Footer */
        .dashboard-footer {
          margin-top: 4rem;
          padding: 2rem;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
        }

        .footer-logo {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.25rem;
        }

        .footer-tagline {
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .footer-stats {
          display: flex;
          gap: 2rem;
        }

        .footer-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .footer-links {
          display: flex;
          gap: 1.5rem;
        }

        .footer-links a {
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-links a:hover {
          color: #e2e8f0;
        }
      `}</style>
    </div>
  );
}