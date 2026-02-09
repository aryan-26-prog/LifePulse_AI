import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import API from "../../api/api";
import {
  Activity,
  Shield,
  TrendingUp,
  Globe,
  AlertCircle,
  RefreshCw,
  Thermometer,
  Wind,
  Droplets,
  Cloud,
  Clock,
  MapPin,
  ChevronRight,
  Eye,
  Zap,
  Cpu
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

const REFRESH_INTERVAL = 5 * 60;

// Background Animation Component (Same as Home)
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

// Pulse Animation Component
const PulseIndicator = () => (
  <div className="pulse-container">
    <div className="pulse-ring"></div>
    <div className="pulse-ring delay-1"></div>
    <div className="pulse-dot"></div>
  </div>
);

// Wave Graph Component
const WaveGraph = ({ data }) => {
  return (
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
    </div>
  );
};

export default function AreaDetails() {
  const { areaName } = useParams();
  const [params] = useSearchParams();
  const lat = params.get("lat");
  const lng = params.get("lng");

  const [env, setEnv] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [activeTab, setActiveTab] = useState('overview');
  const timerRef = useRef();
  const refreshIntervalRef = useRef();

  const fetchData = async () => {
    try {
      setLoading(true);
      if (lat && lng) {
        const res = await API.get(
          `/public/environment/coords?lat=${lat}&lng=${lng}`
        );
        setEnv(res.data);
      } else {
        const res = await API.get(
          `/public/environment/area?area=${areaName}`
        );
        setEnv(res.data);

        const hist = await API.get(
          `/public/environment/history?area=${areaName}`
        );
        setHistory(hist.data);
      }

      setCountdown(REFRESH_INTERVAL);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();

    refreshIntervalRef.current = setInterval(fetchData, REFRESH_INTERVAL * 1000);

    timerRef.current = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : REFRESH_INTERVAL));
    }, 1000);

    return () => {
      clearInterval(refreshIntervalRef.current);
      clearInterval(timerRef.current);
    };
  }, [areaName, lat, lng]);

  const getAQIColor = (a) => {
    if (a <= 50) return "#10b981";
    if (a <= 100) return "#f59e0b";
    if (a <= 200) return "#f97316";
    if (a <= 300) return "#ef4444";
    return "#8b5cf6";
  };

  const getAQILabel = (a) => {
    if (a <= 50) return "Good";
    if (a <= 100) return "Moderate";
    if (a <= 200) return "Unhealthy";
    if (a <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  const getRiskLevel = (aqi) => {
    if (aqi <= 50) return { level: "Low", icon: "🟢" };
    if (aqi <= 100) return { level: "Moderate", icon: "🟡" };
    if (aqi <= 200) return { level: "High", icon: "🟠" };
    if (aqi <= 300) return { level: "Severe", icon: "🔴" };
    return { level: "Critical", icon: "🟣" };
  };

  const trend =
    history.length >= 2
      ? history[history.length - 1].aqi -
        history[history.length - 2].aqi
      : 0;

  const trendSymbol =
    trend > 5 ? "📈 Rising" :
    trend < -5 ? "📉 Falling" :
    "➖ Stable";

  const pollutantData = env?.aqi?.pollutants ? Object.entries(env.aqi.pollutants).map(
    ([k, v]) => ({ name: k.toUpperCase(), value: v })
  ) : [];

  const dominantPollutant = pollutantData.reduce((a, b) =>
    a.value > b.value ? a : b, { name: "N/A", value: 0 }
  );

  const healthScore = env?.health?.score ?? 0;
  const healthStatus = env?.health?.status ?? "";
  const suggestions = env?.health?.suggestions ?? [];
  const exposurePercent = Math.min(
    100,
    Math.round(((env?.aqi?.index ?? 0) / 500) * 100)
  );

  const locationInfo = lat && lng 
    ? `${lat}, ${lng}` 
    : areaName ? areaName.replace(/%20/g, " ") : "Unknown Location";

  // Tab navigation
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Eye size={16} /> },
    { id: 'pollution', label: 'Pollution', icon: <Cloud size={16} /> },
    { id: 'health', label: 'Health Impact', icon: <Activity size={16} /> },
    { id: 'history', label: 'History', icon: <Clock size={16} /> },
  ];

  if (loading) {
    return (
      <div className="industrial-dashboard">
        <BackgroundAnimation />
        <div className="loading-container">
          <div className="loading-spinner">
            <RefreshCw size={32} className="spinning" />
          </div>
          <h2>Initializing live environment feed...</h2>
          <p>Fetching real-time data for {locationInfo}</p>
        </div>
      </div>
    );
  }

  if (!env) {
    return (
      <div className="industrial-dashboard">
        <BackgroundAnimation />
        <div className="error-container">
          <AlertCircle size={48} />
          <h2>Unable to load data</h2>
          <p>Please check your connection and try again</p>
          <button onClick={fetchData} className="retry-button">
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="industrial-dashboard">
      <BackgroundAnimation />
      
      {/* Header */}
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
          
          <div className="location-badge">
            <MapPin size={14} />
            <span>{locationInfo}</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="live-badge">
            <PulseIndicator />
            LIVE DATA
          </div>
          
          <div className="refresh-info">
            <button onClick={handleManualRefresh} className="refresh-button">
              <RefreshCw size={16} />
            </button>
            <span className="refresh-timer">Refreshes in {countdown}s</span>
          </div>
          
          <div className="time-display">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Hero Section with AQI */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="badge-container">
              <span className="industry-badge">ENVIRONMENTAL MONITORING</span>
              <span className="version-badge">Real-time</span>
            </div>
            
            <h1 className="hero-title">
              {locationInfo}
              <span className="title-gradient"> Air Quality Dashboard</span>
            </h1>
            
            <p className="hero-description">
              Real-time environmental monitoring with predictive analytics and health impact assessment
            </p>
            
            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="quick-stat active">
                <div className="stat-icon" style={{ color: getAQIColor(env.aqi.index) }}>
                  <Shield size={20} />
                </div>
                <div className="stat-details">
                  <div className="stat-value">{env.aqi.index}</div>
                  <div className="stat-label">AQI Index</div>
                </div>
                <div className="stat-change">{getAQILabel(env.aqi.index)}</div>
              </div>
              
              <div className="quick-stat">
                <div className="stat-icon" style={{ color: "#10b981" }}>
                  <Activity size={20} />
                </div>
                <div className="stat-details">
                  <div className="stat-value">{healthScore}/100</div>
                  <div className="stat-label">Health Score</div>
                </div>
                <div className="stat-change">{healthStatus}</div>
              </div>
              
              <div className="quick-stat">
                <div className="stat-icon" style={{ color: "#3b82f6" }}>
                  <TrendingUp size={20} />
                </div>
                <div className="stat-details">
                  <div className="stat-value">{trendSymbol}</div>
                  <div className="stat-label">Trend</div>
                </div>
                <div className="stat-change">{Math.abs(trend)} points</div>
              </div>
              
              <div className="quick-stat">
                <div className="stat-icon" style={{ color: "#f59e0b" }}>
                  <Globe size={20} />
                </div>
                <div className="stat-details">
                  <div className="stat-value">{dominantPollutant.name}</div>
                  <div className="stat-label">Dominant Pollutant</div>
                </div>
                <div className="stat-change">{dominantPollutant.value} μg/m³</div>
              </div>
            </div>
          </div>
          
          {/* Main AQI Card */}
          <div className="aqi-hero-card">
            <div className="aqi-header">
              <h3>Air Quality Index</h3>
              <div className="risk-badge" style={{ background: getAQIColor(env.aqi.index) }}>
                {getRiskLevel(env.aqi.index).icon} {getRiskLevel(env.aqi.index).level}
              </div>
            </div>
            
            <div className="aqi-display">
              <div 
                className="aqi-circle"
                style={{
                  background: `conic-gradient(${getAQIColor(env.aqi.index)} ${(env.aqi.index / 500) * 360}deg, #1e293b 0deg)`
                }}
              >
                <div className="aqi-inner">
                  <h1>{env.aqi.index}</h1>
                  <p>{env.aqi.label}</p>
                </div>
              </div>
              
              <div className="aqi-details">
                <div className="aqi-detail">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">{trendSymbol}</span>
                </div>
                <div className="aqi-detail">
                  <span className="detail-label">Updated</span>
                  <span className="detail-value">Just now</span>
                </div>
                <div className="aqi-detail">
                  <span className="detail-label">Exposure</span>
                  <span className="detail-value">{exposurePercent}%</span>
                </div>
              </div>
            </div>
            
            <WaveGraph />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Left Column */}
          <div className="grid-left">
            {/* Weather Card */}

            {/* Risk Status Card */}
            <div 
              className="card risk-card"
              style={{ background: getAQIColor(env.aqi.index) }}
            >
              <div className="card-header">
                <h3>⚠️ Area Risk Status</h3>
                <AlertCircle size={20} />
              </div>
              <div className="risk-content">
                <p>
                  {env.aqi.index <= 100
                    ? "✅ Safe for general public. Normal outdoor activities allowed."
                    : env.aqi.index <= 200
                    ? "⚠️ Sensitive groups at risk. Consider limiting prolonged exposure."
                    : "🚨 Emergency-level pollution. Immediate action required."}
                </p>
              </div>
            </div>

            <div className="card weather-card">
              <div className="card-header">
                <h3>🌤️ Live Weather</h3>
                <Thermometer size={20} />
              </div>
              <div className="weather-grid">
                <div className="weather-item">
                  <Thermometer size={24} />
                  <div>
                    <div className="weather-value">{env.weather.temp} °C</div>
                    <div className="weather-label">Temperature</div>
                  </div>
                </div>
                <div className="weather-item">
                  <Droplets size={24} />
                  <div>
                    <div className="weather-value">{env.weather.humidity}%</div>
                    <div className="weather-label">Humidity</div>
                  </div>
                </div>
                <div className="weather-item">
                  <Wind size={24} />
                  <div>
                    <div className="weather-value">{env.weather.windSpeed} m/s</div>
                    <div className="weather-label">Wind Speed</div>
                  </div>
                </div>
                <div className="weather-item">
                  <Cloud size={24} />
                  <div>
                    <div className="weather-value">{env.weather.condition}</div>
                    <div className="weather-label">Condition</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="grid-middle">
            {/* AQI History Chart */}
            {history.length > 0 && (
              <div className="card chart-card">
                <div className="card-header">
                  <h3>📊 AQI Movement (24h)</h3>
                  <TrendingUp size={20} />
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={history}>
                    <XAxis
                      dataKey="timestamp"
                      tick={{ fill: '#94a3b8' }}
                      tickFormatter={(t) =>
                        new Date(t).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      }
                    />
                    <YAxis 
                      domain={[0, 500]} 
                      tick={{ fill: '#94a3b8' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(t) =>
                        new Date(t).toLocaleString("en-IN")
                      }
                    />
                    <Line
                      dataKey="aqi"
                      stroke={getAQIColor(env.aqi.index)}
                      strokeWidth={3}
                      dot={false}
                      strokeLinecap="round"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Pollutant Chart */}
            <div className="card chart-card">
              <div className="card-header">
                <h3>🧪 Pollutant Intensity</h3>
                <Cpu size={20} />
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={pollutantData}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis tick={{ fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="chart-footer">
                <span>🚨 Dominant Pollutant:</span>
                <span className="dominant-pollutant">{dominantPollutant.name}</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="grid-right">
            {/* Health Impact Card */}
            <div className="card health-card">
              <div className="card-header">
                <h3>❤️ Health Impact Analysis</h3>
                <Activity size={20} />
              </div>
              
              <div className="health-score">
                <div className="score-display">
                  <h1>{healthScore}/100</h1>
                  <p>{healthStatus}</p>
                </div>
                
                <div className="exposure-meter">
                  <div className="meter-label">
                    <span>Exposure Intensity</span>
                    <span>{exposurePercent}%</span>
                  </div>
                  <div className="meter-bar">
                    <div 
                      className="meter-fill"
                      style={{ 
                        width: `${exposurePercent}%`,
                        background: getAQIColor(env.aqi.index)
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Smart Suggestions */}
              <div className="suggestions-section">
                <h4>🩺 Smart Suggestions</h4>
                <div className="suggestions-list">
                  {suggestions.map((suggestion, i) => (
                    <div key={i} className="suggestion-item">
                      <Zap size={14} />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Suggestions */}
              {env.aiSuggestions && (
                <div className="ai-suggestions">
                  <div className="ai-header">
                    <Cpu size={16} />
                    <h4>🤖 AI Advisory</h4>
                  </div>
                  <div className="ai-content">
                    {env.aiSuggestions}
                  </div>
                </div>
              )}

              {/* Health Pie Chart */}
              <div className="health-chart">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Health Stress", value: healthScore },
                        { name: "Safe Capacity", value: 100 - healthScore }
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={5}
                    >
                      <Cell fill={getAQIColor(env.aqi.index)} />
                      <Cell fill="#334155" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color" style={{ background: getAQIColor(env.aqi.index) }}></div>
                    <span>Health Impact</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ background: '#334155' }}></div>
                    <span>Safe Capacity</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">LifePulse AI Environment Monitor</span>
              <span className="footer-tagline">Real-time Environmental Intelligence</span>
            </div>
            
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="stat-number">{history.length}</span>
                <span className="stat-label">Data Points</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">{env.aqi.index <= 100 ? 'Safe' : 'Alert'}</span>
                <span className="stat-label">Status</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">{REFRESH_INTERVAL}s</span>
                <span className="stat-label">Update Interval</span>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <span>© 2024 LifePulse AI. Monitoring {locationInfo}</span>
            <div className="footer-links">
              <a href="#">Export Data</a>
              <a href="#">Share Report</a>
              <a href="#">Get Alerts</a>
            </div>
          </div>
        </footer>
      </main>

      {/* Add CSS animations */}
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
        
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.2); }
        }
        
        .spinning {
          animation: spin 2s linear infinite;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 20px;
        }
        
        .loading-spinner {
          animation: pulse 1.5s ease-in-out infinite;
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
        
        .wave-bar {
          animation: wave 1.5s ease-in-out infinite;
          transform-origin: bottom;
        }
      `}</style>
    </div>
  );
}