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
  Mic,
  MicOff,
  Volume2,
  Moon,
  AlertTriangle,
  Heart,
  MapPin as MapPinIcon,
  Clock,
  CheckCircle,
  Thermometer,
  Headphones,
  User,
  Navigation,
  Keyboard,
  Type
} from "lucide-react";
import API from "../../api/api";

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

export default function HealthCheckin() {
  const navigate = useNavigate();

  const recognitionRef = useRef(null);
  const stepRef = useRef("sleep");
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Click voice button to start");
  const [location, setLocation] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeMetric, setActiveMetric] = useState(0);
  const [inputMode, setInputMode] = useState("voice"); // "voice" or "manual"
  const [liveData, setLiveData] = useState({
    healthIndex: 87,
    activeAlerts: 3,
    coverage: "92%",
    users: "50K+"
  });

  const [formData, setFormData] = useState({
    sleep: "",
    stress: "",
    symptoms: "",
    area: ""
  });

  // Live data simulation (SAME AS HOME)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        healthIndex: Math.max(70, Math.min(98, prev.healthIndex + (Math.random() - 0.5) * 2)),
        activeAlerts: Math.max(1, Math.min(5, prev.activeAlerts + (Math.random() > 0.7 ? 1 : -1)))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Location fetch
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (error) => {
          console.error("Location error:", error);
          setLocation({ lat: 0, lng: 0 });
        }
      );
    }
  }, []);

  const metrics = [
    { icon: <Activity size={20} />, label: "Health Index", value: "87.3", change: "+2.1%", color: "#10b981" },
    { icon: <Shield size={20} />, label: "Active Users", value: "50K+", change: "Growing", color: "#3b82f6" },
    { icon: <TrendingUp size={20} />, label: "Daily Check-ins", value: "1K+", change: "Today", color: "#8b5cf6" },
    { icon: <Globe size={20} />, label: "Coverage", value: "92%", change: "+1.3%", color: "#f59e0b" },
  ];

  const features = [
    { icon: <Cpu />, title: "AI-Powered Voice", desc: "Voice recognition for health data" },
    { icon: <BarChart3 />, title: "Real-time Analysis", desc: "Instant health insights" },
    { icon: <Users />, title: "Community Health", desc: "Contribute to public data" },
    { icon: <MapPin />, title: "Location Tracking", desc: "Geospatial health monitoring" },
  ];

  const alerts = [
    { id: 1, type: "info", location: "System", message: "Voice check-in ready", time: "Just now" },
    { id: 2, type: "success", location: "Security", message: "Location detected", time: "1 min ago" },
    { id: 3, type: "warning", location: "Reminder", message: "Complete all steps", time: "2 min ago" },
  ];

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech recognition not supported");
      setStatus("Voice not supported in your browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Heard:", transcript);
      handleStep(transcript.trim().toLowerCase());
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "aborted") {
        return;
      }
      setIsListening(false);
      setStatus(`Error: ${event.error}. Click to retry.`);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // Text-to-Speech function
  const speak = (text) => {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        const msg = new SpeechSynthesisUtterance(text);
        msg.rate = 1.0;
        msg.pitch = 1.0;
        msg.volume = 1.0;
        
        msg.onstart = () => {
          console.log("Started speaking:", text);
          setIsSpeaking(true);
        };

        msg.onend = () => {
          console.log("Finished speaking:", text);
          setIsSpeaking(false);
          resolve();
        };

        msg.onerror = (event) => {
          console.error("Speech synthesis error:", event);
          setIsSpeaking(false);
          resolve();
        };

        if (recognitionRef.current && isListening) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.log("Already stopped");
          }
        }

        setTimeout(() => {
          window.speechSynthesis.speak(msg);
        }, 100);
      }, 200);
    });
  };

  // Start recognition after speaking
  const startRecognition = () => {
    if (!recognitionRef.current) return;
    
    if (isSpeaking) {
      setTimeout(startRecognition, 300);
      return;
    }
    
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      
      setTimeout(() => {
        if (recognitionRef.current && stepRef.current !== "done") {
          recognitionRef.current.start();
          setStatus(`Listening for ${stepRef.current}...`);
        }
      }, 500);
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setStatus("Failed to start listening");
    }
  };

  // Step handling logic
  const handleStep = async (text) => {
    const step = stepRef.current;
    console.log(`Step: ${step}, Text: ${text}`);
    
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }

    if (step === "sleep") {
      const hours = text.match(/\d+/);
      if (hours) {
        const hourValue = hours[0];
        if (hourValue >= 0 && hourValue <= 24) {
          setFormData((prev) => ({ ...prev, sleep: hourValue }));
          stepRef.current = "stress";
          setStatus("Sleep hours recorded. Now tell stress level (0-10)");
          await speak("Thank you. Now, please tell me your stress level from zero to ten.");
          startRecognition();
        } else {
          await speak("Please give a valid number between zero and twenty four hours.");
          startRecognition();
        }
      } else {
        await speak("I didn't catch the number. Please tell your sleep hours in numbers.");
        startRecognition();
      }
    } 
    else if (step === "stress") {
      const stressLevel = text.match(/\d+/);
      if (stressLevel) {
        const level = stressLevel[0];
        if (level >= 0 && level <= 10) {
          setFormData((prev) => ({ ...prev, stress: level }));
          stepRef.current = "symptoms";
          setStatus("Stress level recorded. Now describe symptoms");
          await speak("Thank you. Now, please tell me any symptoms you're experiencing.");
          startRecognition();
        } else {
          await speak("Please give a stress level between zero and ten.");
          startRecognition();
        }
      } else {
        await speak("I didn't catch the number. Please tell your stress level from zero to ten.");
        startRecognition();
      }
    } 
    else if (step === "symptoms") {
      if (text.length > 2) {
        setFormData((prev) => ({ ...prev, symptoms: text }));
        stepRef.current = "area";
        setStatus("Symptoms recorded. Now tell your area/locality");
        await speak("Thank you. Finally, please tell me your area or locality name.");
        startRecognition();
      } else {
        await speak("Please describe your symptoms in more detail.");
        startRecognition();
      }
    } 
    else if (step === "area") {
      if (text.length > 2) {
        const updatedData = {
          ...formData,
          area: text
        };
        setFormData(updatedData);
        stepRef.current = "done";
        setStatus("Submitting your data...");
        
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        
        await speak("Thank you. Submitting your health check-in data now.");
        await submitData(updatedData);
      } else {
        await speak("Please tell me your area name properly.");
        startRecognition();
      }
    }
  };

  // Start voice input
  const startVoiceCheckin = async () => {
    if (!recognitionRef.current) {
      setStatus("Voice recognition not available");
      setInputMode("manual");
      return;
    }

    try {
      stepRef.current = "sleep";
      setStatus("Starting voice check-in...");

      window.speechSynthesis.cancel();
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      await speak("Welcome to voice health check-in. Please tell me how many hours you slept last night.");
      
      startRecognition();

    } catch (err) {
      console.error("Failed to start voice checkin:", err);
      setStatus("Failed to start voice input");
    }
  };

  // Stop voice input
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log("Already stopped");
      }
    }
    setIsListening(false);
    setStatus("Voice input stopped");
    window.speechSynthesis.cancel();
  };

  // Handle manual input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-advance step for manual input
    if (inputMode === "manual") {
      if (name === "sleep" && value && stepRef.current === "sleep") {
        stepRef.current = "stress";
        setStatus("Sleep hours recorded. Enter stress level");
      } else if (name === "stress" && value && stepRef.current === "stress") {
        stepRef.current = "symptoms";
        setStatus("Stress level recorded. Enter symptoms");
      } else if (name === "symptoms" && value && stepRef.current === "symptoms") {
        stepRef.current = "area";
        setStatus("Symptoms recorded. Enter area/locality");
      } else if (name === "area" && value && stepRef.current === "area") {
        stepRef.current = "done";
        setStatus("All data recorded. Ready to submit");
      }
    }
  };

  // Submit data (used by both voice and manual)
  const submitData = async (data) => {
    try {
      const symptomsArray = data.symptoms
        .split(/[,.]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const submissionData = {
        sleep: parseInt(data.sleep) || 0,
        stress: parseInt(data.stress) || 0,
        symptoms: symptomsArray,
        location: {
          lat: location?.lat || 0,
          lng: location?.lng || 0,
          area: data.area
        },
        timestamp: new Date().toISOString()
      };

      console.log("Submitting:", submissionData);

      await API.post("/health", submissionData);
      navigate("/citizen/analyzing");

    } catch (error) {
      console.error("Submission failed:", error);
      setStatus("Submission failed. Please try again.");
      if (inputMode === "voice") {
        await speak("Sorry, there was an error submitting your data. Please try again.");
      }
    }
  };

  // Manual form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitData(formData);
  };

  // Switch to manual input mode
  const switchToManual = () => {
    if (isListening || isSpeaking) {
      stopListening();
    }
    setInputMode("manual");
    setStatus("Manual input mode enabled. Fill the form below.");
  };

  // Switch to voice input mode
  const switchToVoice = () => {
    setInputMode("voice");
    setStatus("Voice input mode enabled. Click start to begin.");
  };

  // Validate form before submission
  const isFormValid = () => {
    return formData.sleep && formData.stress && formData.symptoms && formData.area;
  };

  if (!location) {
    return (
      <div className="industrial-dashboard">
        <BackgroundAnimation />
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Getting your location...</p>
        </div>
      </div>
    );
  }

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
            <span>Health Check-in</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="live-badge">
            <div className="live-pulse"></div>
            {inputMode === "voice" ? "VOICE MODE" : "MANUAL MODE"}
          </div>
          <div className="time-display">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="hero-section">
          {/* Left Content */}
          <div className="hero-content">
            <div className="badge-container">
              <span className="industry-badge">HEALTH CHECK-IN</span>
              <span className="version-badge">v2.4.1</span>
            </div>
            
            <h1 className="hero-title">
              Daily Health
              <span className="title-gradient"> Check-in</span>
              <br />
              <span className="title-sub">Powered by AI</span>
            </h1>
            
            <p className="hero-description">
              Complete your daily health check-in using voice or manual input. 
              Choose your preferred method to submit health data securely.
            </p>
            
            {/* Live Alerts */}
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
          
          {/* Right: Check-in Panel */}
          <div className="data-visualization">
            <div className="viz-header">
              <h3>Health Check-in</h3>
              <div className="viz-controls">
                <div className="input-mode-selector">
                  <button
                    className={`mode-btn ${inputMode === 'voice' ? 'active' : ''}`}
                    onClick={switchToVoice}
                  >
                    <Mic size={14} />
                    Voice
                  </button>
                  <button
                    className={`mode-btn ${inputMode === 'manual' ? 'active' : ''}`}
                    onClick={switchToManual}
                  >
                    <Keyboard size={14} />
                    Manual
                  </button>
                </div>
              </div>
            </div>
            
            {/* Input Mode Panel */}
            {inputMode === "voice" ? (
              <div className="voice-status-panel">
                <div className={`status-indicator-large ${isListening ? 'listening' : isSpeaking ? 'speaking' : 'idle'}`}>
                  <div className="status-icon">
                    {isListening ? <Mic size={32} /> : isSpeaking ? <Volume2 size={32} /> : <Headphones size={32} />}
                  </div>
                  <div className="status-text">
                    <div className="status-title">
                      {isListening ? "LISTENING" : isSpeaking ? "SPEAKING" : "VOICE MODE"}
                    </div>
                    <div className="status-message">
                      {status}
                    </div>
                  </div>
                </div>
                
                {/* Current Step */}
                <div className="step-tracker">
                  <div className="step-header">
                    <Navigation size={16} />
                    <span>Current Step</span>
                  </div>
                  <div className="step-display">
                    <div className={`step ${stepRef.current === 'sleep' ? 'active' : 'completed'}`}>
                      <Moon size={14} />
                      <span>Sleep Hours</span>
                      {formData.sleep && <CheckCircle size={12} />}
                    </div>
                    <div className={`step ${stepRef.current === 'stress' ? 'active' : stepRef.current === 'sleep' ? 'upcoming' : 'completed'}`}>
                      <Thermometer size={14} />
                      <span>Stress Level</span>
                      {formData.stress && <CheckCircle size={12} />}
                    </div>
                    <div className={`step ${stepRef.current === 'symptoms' ? 'active' : ['sleep', 'stress'].includes(stepRef.current) ? 'upcoming' : 'completed'}`}>
                      <AlertTriangle size={14} />
                      <span>Symptoms</span>
                      {formData.symptoms && <CheckCircle size={12} />}
                    </div>
                    <div className={`step ${stepRef.current === 'area' ? 'active' : ['sleep', 'stress', 'symptoms'].includes(stepRef.current) ? 'upcoming' : stepRef.current === 'done' ? 'completed' : 'upcoming'}`}>
                      <MapPinIcon size={14} />
                      <span>Location</span>
                      {formData.area && <CheckCircle size={12} />}
                    </div>
                  </div>
                </div>
                
                {/* Voice Controls */}
                <div className="voice-controls">
                  <button
                    type="button"
                    onClick={startVoiceCheckin}
                    disabled={isListening || isSpeaking}
                    className={`primary-cta voice-btn ${isListening ? 'listening' : isSpeaking ? 'speaking' : ''}`}
                  >
                    {isListening ? (
                      <>
                        <Mic size={20} />
                        <span>Listening...</span>
                      </>
                    ) : isSpeaking ? (
                      <>
                        <Volume2 size={20} />
                        <span>Speaking...</span>
                      </>
                    ) : (
                      <>
                        <Mic size={20} />
                        <span>Start Voice Check-in</span>
                      </>
                    )}
                  </button>
                  
                  {(isListening || isSpeaking) && (
                    <button
                      type="button"
                      onClick={stopListening}
                      className="secondary-cta"
                    >
                      <MicOff size={18} />
                      <span>Stop</span>
                    </button>
                  )}
                </div>
                
                {/* Current Instructions */}
                <div className="instructions-box">
                  <div className="instructions-header">
                    <Clock size={16} />
                    <span>Voice Instructions</span>
                  </div>
                  <div className="instructions-content">
                    {stepRef.current === "sleep" && "Say something like '7 hours' or 'I slept 8 hours'"}
                    {stepRef.current === "stress" && "Say a number between 0 and 10"}
                    {stepRef.current === "symptoms" && "Describe your symptoms"}
                    {stepRef.current === "area" && "Say your area name"}
                    {stepRef.current === "done" && "Check-in completed!"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="manual-input-panel">
                <div className="manual-header">
                  <div className="manual-icon">
                    <Keyboard size={32} />
                  </div>
                  <div>
                    <h4>Manual Input Mode</h4>
                    <p>Fill in the form below to submit your health data</p>
                  </div>
                </div>
                
                {/* Manual Form */}
                <form className="manual-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <Moon size={16} />
                        Sleep Hours (0-24)
                      </label>
                      <input
                        type="number"
                        name="sleep"
                        min="0"
                        max="24"
                        value={formData.sleep}
                        onChange={handleInputChange}
                        placeholder="Enter hours"
                        className="manual-input"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        <Thermometer size={16} />
                        Stress Level (0-10)
                      </label>
                      <input
                        type="number"
                        name="stress"
                        min="0"
                        max="10"
                        value={formData.stress}
                        onChange={handleInputChange}
                        placeholder="0 = no stress, 10 = max"
                        className="manual-input"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <AlertTriangle size={16} />
                      Symptoms (comma separated)
                    </label>
                    <input
                      type="text"
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      placeholder="e.g., headache, fever, cough"
                      className="manual-input"
                      required
                    />
                    <div className="input-hint">
                      Separate multiple symptoms with commas
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <MapPinIcon size={16} />
                      Area/Locality
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      placeholder="Your current area"
                      className="manual-input"
                      required
                    />
                  </div>
                </form>
              </div>
            )}
            
            {/* Health Data Summary */}
            <div className="health-summary">
              <div className="summary-header">
                <Heart size={18} />
                <span>Health Data Summary</span>
              </div>
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-label">Sleep Hours</div>
                  <div className="summary-value">{formData.sleep || "Not recorded"}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Stress Level</div>
                  <div className="summary-value">{formData.stress || "Not recorded"}</div>
                </div>
                <div className="summary-item full-width">
                  <div className="summary-label">Symptoms</div>
                  <div className="summary-value">{formData.symptoms || "Not recorded"}</div>
                </div>
                <div className="summary-item full-width">
                  <div className="summary-label">Location</div>
                  <div className="summary-value">{formData.area || "Not recorded"}</div>
                </div>
              </div>
              
              <button 
                type="button"
                onClick={handleSubmit}
                className="primary-cta form-submit"
                disabled={!isFormValid()}
              >
                <span>Submit Health Data</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-section">
          <h2 className="section-title">Check-in Features</h2>
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
              <span className="footer-tagline">Health Monitoring Platform</span>
            </div>
            
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Monitoring</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Accuracy</span>
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