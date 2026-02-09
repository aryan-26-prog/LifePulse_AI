import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";
import {
  FileText,
  Users,
  Clock,
  Image as ImageIcon,
  Upload,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Camera,
  Activity
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

export default function SubmitReport() {
  const { campId } = useParams();
  const volunteerId = localStorage.getItem("volunteerId");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    description: "",
    peopleHelped: "",
    hoursWorked: ""
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    // Create previews
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...previews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const submitReport = async (e) => {
    e.preventDefault();
    
    if (!form.description || !form.peopleHelped || !form.hoursWorked) {
      alert("Please fill in all required fields");
      return;
    }

    const data = new FormData();
    data.append("campId", campId);
    data.append("description", form.description);
    data.append("peopleHelped", form.peopleHelped);
    data.append("hoursWorked", form.hoursWorked);

    images.forEach(img => {
      data.append("images", img);
    });

    try {
      setSubmitting(true);
      await API.post(`/work-report/submit/${volunteerId}`, data);
      
      setSuccess(true);
      setTimeout(() => {
        navigate("/volunteer", { state: { refresh: true } });
      }, 2000);
      
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
            <span>Report Submission</span>
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className="back-btn"
            onClick={() => navigate("/volunteer")}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <div className="time-display">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="form-container">
          {/* Success Message */}
          {success && (
            <div className="success-message">
              <CheckCircle size={48} />
              <h2>Report Submitted Successfully!</h2>
              <p>Redirecting to dashboard...</p>
            </div>
          )}

          {/* Form Content */}
          {!success && (
            <>
              <div className="form-header">
                <div className="badge-container">
                  <span className="industry-badge">WORK REPORT</span>
                  <span className="version-badge">Camp #{campId?.slice(-4)}</span>
                </div>
                
                <h1 className="hero-title">
                  Submit
                  <span className="title-gradient"> Work Report</span>
                </h1>
                
                <p className="hero-description">
                  Document your humanitarian work to help track impact and earn XP points.
                  Provide detailed information about your contributions.
                </p>
              </div>

              <form className="report-form" onSubmit={submitReport}>
                {/* Description Field */}
                <div className="form-group">
                  <div className="form-label">
                    <FileText size={18} />
                    <span>Work Description</span>
                    <span className="required">*</span>
                  </div>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe the work you did in detail... What activities did you perform? What impact did you make? What challenges did you face?"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={6}
                    required
                  />
                  <div className="form-help">
                    <AlertCircle size={14} />
                    <span>Be as detailed as possible to help with verification</span>
                  </div>
                </div>

                {/* Stats Fields */}
                <div className="form-row">
                  <div className="form-group">
                    <div className="form-label">
                      <Users size={18} />
                      <span>People Helped</span>
                      <span className="required">*</span>
                    </div>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Enter number of people"
                      value={form.peopleHelped}
                      onChange={(e) => setForm({ ...form, peopleHelped: e.target.value })}
                      min="1"
                      max="10000"
                      required
                    />
                    <div className="form-help">
                      <span>Approximate number of people you assisted</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-label">
                      <Clock size={18} />
                      <span>Hours Worked</span>
                      <span className="required">*</span>
                    </div>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Enter hours"
                      value={form.hoursWorked}
                      onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })}
                      min="0.5"
                      max="24"
                      step="0.5"
                      required
                    />
                    <div className="form-help">
                      <span>Time spent on relief work (in hours)</span>
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="form-group">
                  <div className="form-label">
                    <ImageIcon size={18} />
                    <span>Evidence Photos (Optional)</span>
                  </div>
                  
                  <div 
                    className="upload-area"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <Upload size={32} />
                    <div className="upload-text">
                      <h4>Upload Evidence Photos</h4>
                      <p>Click or drag images here to upload</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                    />
                  </div>
                  
                  <div className="form-help">
                    <AlertCircle size={14} />
                    <span>Upload photos of your work as evidence (max 5 images)</span>
                  </div>

                  {/* Image Previews */}
                  {previews.length > 0 && (
                    <div className="image-previews">
                      <h4>Selected Images ({images.length})</h4>
                      <div className="preview-grid">
                        {previews.map((preview, index) => (
                          <div key={index} className="preview-item">
                            <img src={preview} alt={`Evidence ${index + 1}`} />
                            <button
                              type="button"
                              className="remove-image"
                              onClick={() => removeImage(index)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="action-btn outline"
                    onClick={() => navigate("/volunteer")}
                  >
                    <ArrowLeft size={16} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="action-btn primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="spinner"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Report
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </div>

                {/* Form Tips */}
                <div className="form-tips">
                  <div className="tip">
                    <CheckCircle size={16} />
                    <span>Complete reports earn more XP points</span>
                  </div>
                  <div className="tip">
                    <CheckCircle size={16} />
                    <span>Photos help with verification and approval</span>
                  </div>
                  <div className="tip">
                    <CheckCircle size={16} />
                    <span>You'll be notified when your report is reviewed</span>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer - Same as Home */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">LifePulse AI</span>
              <span className="footer-tagline">Humanitarian Work Tracking</span>
            </div>
            
            <div className="footer-stats">
              <div className="footer-stat">
                <span className="stat-number">XP</span>
                <span className="stat-label">Points Earned</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">Reports</span>
                <span className="stat-label">Submitted</span>
              </div>
              <div className="footer-stat">
                <span className="stat-number">Real-time</span>
                <span className="stat-label">Tracking</span>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <span>© 2024 LifePulse AI. Report Submission Portal.</span>
            <div className="footer-links">
              <span onClick={() => navigate('/volunteer')}>Dashboard</span>
              <span>Help</span>
              <span>Privacy</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}