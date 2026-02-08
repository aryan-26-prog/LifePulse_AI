import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import {
  Activity,
  Shield,
  TrendingUp,
  Globe,
  Users,
  FileText,
  AlertTriangle,
  Download,
  Settings,
  Eye,
  Trash2,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  Clock,
  Zap,
  Building2,
  Database,
  AlertCircle,
  ChevronRight
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from "recharts";

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [areaStats, setAreaStats] = useState([]);
  const [aiRisk, setAIRisk] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Load all data
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dash, areas, risk, rep] = await Promise.all([
        API.get("/admin/dashboard"),
        API.get("/admin/stats/area"),
        API.get("/admin/ai-risk/area"),
        API.get("/admin/reports")
      ]);

      setStats(dash.data.stats);
      setAreaStats(areas.data.data || []);
      setAIRisk(risk.data.data || []);
      setReports(rep.data.data || []);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Download CSV
  const downloadCSV = async () => {
    try {
      const response = await API.get("/admin/export/csv", {
        responseType: "blob"
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "health_reports.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("CSV Download Error:", error);
      alert("Failed to download CSV");
    }
  };

  // Delete report
  const deleteReport = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;

    try {
      await API.delete(`/admin/report/${id}`);
      setReports(reports.filter(r => r._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete report");
    }
  };

  // Prepare chart data
  const stressSleepChart = areaStats.map(a => ({
    area: a.area?.substring(0, 15) + (a.area?.length > 15 ? "..." : ""),
    Stress: parseFloat(a.avgStress) || 0,
    Sleep: parseFloat(a.avgSleep) || 0
  }));

  const riskChart = aiRisk.map(r => ({
    name: r.area?.substring(0, 10) + (r.area?.length > 10 ? "..." : ""),
    value: r.risk === "HIGH" ? 100 : r.risk === "MEDIUM" ? 60 : 30,
    color: r.risk === "HIGH" ? "#ef4444" : r.risk === "MEDIUM" ? "#f59e0b" : "#10b981"
  }));

  const adminStats = stats ? [
    { icon: <FileText size={20} />, label: "Health Reports", value: stats.totalHealthReports, color: "#3b82f6", change: "+12%" },
    { icon: <Building2 size={20} />, label: "NGOs", value: stats.totalNGOs, color: "#8b5cf6", change: "+3" },
    { icon: <Users size={20} />, label: "Areas", value: areaStats.length, color: "#10b981", change: "+2" },
    { icon: <AlertTriangle size={20} />, label: "Risk Zones", value: aiRisk.filter(r => r.risk === "HIGH").length, color: "#ef4444", change: "Critical" }
  ] : [];

  if (loading) {
    return (
      <div className="industrial-dashboard">
        <BackgroundAnimation />
        <div className="loading-container">
          <div className="loading-spinner">
            <RefreshCw size={32} className="spinning" />
          </div>
          <h2>Loading Admin Dashboard...</h2>
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
              <span className="logo-sub">Admin</span>
            </div>
          </div>
          <div className="status-indicator">
            <div className="status-dot active"></div>
            <span>Administration System Online</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="live-badge">
            <PulseIndicator />
            ADMIN
          </div>
          <button 
            onClick={fetchDashboard}
            className="refresh-btn"
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
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
              <span className="industry-badge">ADMIN CONTROL PANEL</span>
              <span className="version-badge">v2.4.1</span>
            </div>
            
            <h1 className="hero-title">
              System
              <span className="title-gradient"> Administration</span>
            </h1>
            
            <p className="hero-description">
              Centralized platform for monitoring health data, managing NGOs, 
              and overseeing environmental risk assessments across all monitored regions.
            </p>
            
            {/* Admin Stats */}
            <div className="quick-stats">
              {adminStats.map((stat, index) => (
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

            {/* Quick Actions */}
            <div className="quick-actions">
              <button 
                className="action-btn primary"
                onClick={downloadCSV}
              >
                <Download size={18} />
                Export Data (CSV)
              </button>
              <button 
                className="action-btn outline"
                onClick={() => navigate("/admin/ngos")}
              >
                <Users size={18} />
                Manage NGOs
              </button>
              <button 
                className="action-btn outline"
                onClick={() => navigate("/admin/settings")}
              >
                <Settings size={18} />
                System Settings
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs-navigation">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={16} />
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'areas' ? 'active' : ''}`}
            onClick={() => setActiveTab('areas')}
          >
            <MapPin size={16} />
            Area Statistics ({areaStats.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={16} />
            Reports ({reports.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'risk' ? 'active' : ''}`}
            onClick={() => setActiveTab('risk')}
          >
            <AlertTriangle size={16} />
            Risk Analysis
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            {/* Charts Section */}
            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>
                    <BarChart3 size={18} />
                    Stress vs Sleep Analysis
                  </h3>
                  <span className="chart-subtitle">Across monitored areas</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stressSleepChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="area" 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="Stress" 
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="Sleep" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>
                    <PieChartIcon size={18} />
                    AI Risk Distribution
                  </h3>
                  <span className="chart-subtitle">Risk level analysis</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskChart}
                      dataKey="value"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={2}
                    >
                      {riskChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: '#ef4444' }}></div>
                    <span>High Risk</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: '#f59e0b' }}></div>
                    <span>Medium Risk</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: '#10b981' }}></div>
                    <span>Low Risk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'areas' && (
          <div className="tab-content">
            <div className="data-table">
              <div className="table-header">
                <h3>Area Health Statistics</h3>
                <div className="table-actions">
                  <span className="table-count">{areaStats.length} areas</span>
                  <button className="export-btn" onClick={downloadCSV}>
                    <Download size={14} />
                    Export
                  </button>
                </div>
              </div>
              
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>
                        <MapPin size={14} />
                        Area
                      </th>
                      <th>
                        <FileText size={14} />
                        Reports
                      </th>
                      <th>
                        <AlertCircle size={14} />
                        Avg Stress
                      </th>
                      <th>
                        <Clock size={14} />
                        Avg Sleep
                      </th>
                      <th>
                        <Zap size={14} />
                        Common Symptoms
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {areaStats.map(a => (
                      <tr key={a.area}>
                        <td className="area-cell">
                          <div className="area-name">{a.area}</div>
                        </td>
                        <td>
                          <span className="stat-badge">{a.totalReports}</span>
                        </td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill stress"
                                style={{ width: `${Math.min(100, (parseFloat(a.avgStress) || 0) * 10)}%` }}
                              ></div>
                            </div>
                            <span className="progress-value">{a.avgStress || "0"}</span>
                          </div>
                        </td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill sleep"
                                style={{ width: `${Math.min(100, (parseFloat(a.avgSleep) || 0) * 20)}%` }}
                              ></div>
                            </div>
                            <span className="progress-value">{a.avgSleep || "0"} hrs</span>
                          </div>
                        </td>
                        <td>
                          <div className="symptoms-cell">
                            {a.commonSymptoms?.slice(0, 2).map((s, i) => (
                              <span key={i} className="symptom-tag">
                                {s}
                              </span>
                            ))}
                            {a.commonSymptoms?.length > 2 && (
                              <span className="more-tag">
                                +{a.commonSymptoms.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="tab-content">
            <div className="data-table">
              <div className="table-header">
                <h3>Health Reports Moderation</h3>
                <div className="table-actions">
                  <span className="table-count">{reports.length} reports</span>
                  <button className="export-btn" onClick={downloadCSV}>
                    <Download size={14} />
                    Export All
                  </button>
                </div>
              </div>
              
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Area</th>
                      <th>Sleep</th>
                      <th>Stress</th>
                      <th>Symptoms</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(r => (
                      <tr key={r._id}>
                        <td>
                          <div className="area-info">
                            <MapPin size={14} />
                            <span>{r.location?.area || "Unknown"}</span>
                          </div>
                        </td>
                        <td>
                          <div className="metric-cell">
                            <div className="metric-value">{r.sleep || "0"}</div>
                            <div className="metric-label">hours</div>
                          </div>
                        </td>
                        <td>
                          <div className="metric-cell">
                            <div 
                              className="stress-level"
                              style={{ 
                                color: (r.stress || 0) > 7 ? '#ef4444' : (r.stress || 0) > 4 ? '#f59e0b' : '#10b981'
                              }}
                            >
                              {r.stress || "0"}
                            </div>
                            <div className="metric-label">level</div>
                          </div>
                        </td>
                        <td>
                          <div className="symptoms-cell">
                            {r.symptoms?.slice(0, 2).map((s, i) => (
                              <span key={i} className="symptom-tag small">
                                {s}
                              </span>
                            ))}
                            {r.symptoms?.length > 2 && (
                              <span className="more-tag">
                                +{r.symptoms.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="status-badge">
                            {r.status || "PENDING"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-icon view"
                              title="View Details"
                              onClick={() => navigate(`/admin/report/${r._id}`)}
                            >
                              <Eye size={14} />
                            </button>
                            <button 
                              className="action-icon delete"
                              title="Delete Report"
                              onClick={() => deleteReport(r._id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {reports.length === 0 && (
                  <div className="empty-table">
                    <FileText size={48} />
                    <p>No health reports available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="tab-content">
            <div className="risk-analysis">
              <h3 className="section-title">AI Risk Analysis</h3>
              
              <div className="risk-grid">
                {aiRisk.map(risk => (
                  <div 
                    key={risk.area}
                    className="risk-card"
                    style={{ 
                      borderLeft: `4px solid ${
                        risk.risk === "HIGH" ? '#ef4444' : 
                        risk.risk === "MEDIUM" ? '#f59e0b' : '#10b981'
                      }`
                    }}
                  >
                    <div className="risk-header">
                      <div className="risk-area">
                        <MapPin size={16} />
                        <span>{risk.area}</span>
                      </div>
                      <div 
                        className={`risk-level ${risk.risk?.toLowerCase()}`}
                      >
                        {risk.risk}
                      </div>
                    </div>
                    
                    <div className="risk-metrics">
                      <div className="metric">
                        <div className="metric-label">AQI</div>
                        <div className="metric-value">{Math.round(risk.avgAQI || 0)}</div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">Stress</div>
                        <div className="metric-value">{risk.avgStress || "0"}</div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">Sleep</div>
                        <div className="metric-value">{risk.avgSleep || "0"}</div>
                      </div>
                    </div>
                    
                    <div className="risk-confidence">
                      <div className="confidence-label">
                        <span>AI Confidence</span>
                        <span>{Math.round((risk.confidence || 0) * 100)}%</span>
                      </div>
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill"
                          style={{ 
                            width: `${(risk.confidence || 0) * 100}%`,
                            background: risk.risk === "HIGH" ? '#ef4444' : 
                                      risk.risk === "MEDIUM" ? '#f59e0b' : '#10b981'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer - Same as Home */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">LifePulse AI Administration</span>
              <span className="footer-tagline">Centralized System Management</span>
            </div>
            
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="stat-number">{stats?.totalHealthReports || "0"}</span>
                <span className="stat-label">Reports</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">{stats?.totalNGOs || "0"}</span>
                <span className="stat-label">NGOs</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Monitoring</span>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <span>© 2024 LifePulse AI. Administrative Control Panel.</span>
            <div className="footer-links">
              <span onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
              <span onClick={() => navigate('/admin/ngos')}>NGOs</span>
              <span>Settings</span>
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