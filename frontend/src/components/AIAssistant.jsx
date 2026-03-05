import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* SMART INTENT ENGINE */
  const commands = [
    /* AUTH */
    {
      keywords: ["login", "sign in", "log in"],
      route: "/login",
      reply: "Opening login page...",
      emoji: "🔐"
    },
    {
      keywords: ["register", "signup", "sign up", "create account"],
      route: "/register",
      reply: "Opening registration...",
      emoji: "📝"
    },
    {
      keywords: ["verify otp", "otp verification", "enter otp"],
      route: "/verify-otp",
      reply: "Opening OTP verification...",
      emoji: "✅"
    },

    /* ROLE SELECT */
    {
      keywords: ["select role", "choose role", "pick role"],
      route: "/select-role",
      reply: "Opening role selection...",
      emoji: "👥"
    },

    /* ===== CITIZEN FLOW ===== */
    {
      keywords: ["health check", "check health", "checkin", "health status"],
      route: "/citizen/checkin",
      reply: "Opening health check-in...",
      emoji: "🏥"
    },
    {
      keywords: ["processing", "analyzing", "analysis"],
      route: "/citizen/analyzing",
      reply: "Opening analysis screen...",
      emoji: "📊"
    },
    {
      keywords: ["city map", "risk map", "map", "heatmap"],
      route: "/citizen/map",
      reply: "Opening city risk map...",
      emoji: "🗺️"
    },

    /* ===== VOLUNTEER ===== */
    {
      keywords: ["volunteer dashboard", "volunteer home"],
      route: "/volunteer",
      reply: "Opening volunteer dashboard...",
      emoji: "🤝"
    },
    {
      keywords: ["volunteer profile", "my profile", "profile", "my account"],
      route: "/volunteer/profile",
      reply: "Opening your profile...",
      emoji: "👤"
    },

    /* ===== NGO ===== */
    {
      keywords: ["ngo dashboard", "ngo home"],
      route: "/ngo",
      reply: "Opening NGO dashboard...",
      emoji: "🏢"
    },
    {
      keywords: ["camp map", "ngo camp map", "relief camps"],
      route: "/ngo/camp-map",
      reply: "Opening camp map...",
      emoji: "📍"
    },

    /* ===== ADMIN ===== */
    {
      keywords: ["admin dashboard", "admin home"],
      route: "/admin",
      reply: "Opening admin dashboard...",
      emoji: "⚙️"
    },
    {
      keywords: ["ngo management", "manage ngos", "ngo list"],
      route: "/admin/ngos",
      reply: "Opening NGO management...",
      emoji: "📋"
    },
    {
      keywords: ["analytics", "reports analytics", "statistics", "reports"],
      route: "/admin/analytics",
      reply: "Opening analytics dashboard...",
      emoji: "📈"
    },
    {
      keywords: ["help", "what can you do", "commands", "features"],
      route: null,
      reply: "I can help you navigate to various sections: Login, Register, Health Check, Maps, Dashboards, Analytics, and more! Just tell me where you want to go.",
      emoji: "🤖"
    }
  ];

  /* DETECT COMMAND */
  const detectCommand = (text) => {
    text = text.toLowerCase();
    
    for (let cmd of commands) {
      if (cmd.keywords.some(k => text.includes(k))) {
        return cmd;
      }
    }
    return null;
  };

  /* SEND MESSAGE */
  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    
    // Show typing indicator
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      const command = detectCommand(input);
      
      if (command) {
        setMessages(prev => [
          ...prev,
          { 
            sender: "bot", 
            text: command.reply,
            emoji: command.emoji 
          }
        ]);

        if (command.route) {
          setTimeout(() => {
            navigate(command.route);
            setOpen(false); // Close chat after navigation
          }, 1500);
        }
      } else {
        setMessages(prev => [
          ...prev,
          { 
            sender: "bot", 
            text: "I didn't understand that. Try saying 'help' to see what I can do!",
            emoji: "😕"
          }
        ]);
      }
      
      setIsTyping(false);
    }, 800);

    setInput("");
  };

  /* VOICE ENGINE */
  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Try Chrome or Edge!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const speech = event.results[0][0].transcript;
      setInput(speech);
      
      // Auto-send after voice input
      setTimeout(() => {
        const userMsg = { sender: "user", text: speech };
        setMessages(prev => [...prev, userMsg]);
        
        setIsTyping(true);
        
        setTimeout(() => {
          const command = detectCommand(speech);
          
          if (command) {
            setMessages(prev => [
              ...prev,
              { 
                sender: "bot", 
                text: command.reply,
                emoji: command.emoji 
              }
            ]);

            if (command.route) {
              setTimeout(() => {
                navigate(command.route);
                setOpen(false);
              }, 1500);
            }
          } else {
            setMessages(prev => [
              ...prev,
              { 
                sender: "bot", 
                text: "Command not recognized. Try saying 'help'!",
                emoji: "😕"
              }
            ]);
          }
          
          setIsTyping(false);
        }, 800);
      }, 500);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  // Stop listening on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  /* UI */
  return (
    <div>
      {/* FLOATING BUTTON - MODERN */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          ...styles.floating,
          ...(open ? styles.floatingActive : {})
        }}
      >
        <span style={styles.floatingIcon}>
          {open ? "✕" : "🤖"}
        </span>
       
      </button>

      {/* CHAT PANEL - REDESIGNED */}
      {open && (
        <div style={styles.panel}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <span style={styles.headerIcon}>🤖</span>
              <div>
                <h4 style={styles.headerTitle}>LifePulse AI</h4>
                <p style={styles.headerSubtitle}>How can I help you?</p>
              </div>
            </div>
            <button 
              onClick={() => setOpen(false)}
              style={styles.closeButton}
            >
              ✕
            </button>
          </div>

          {/* CHAT WINDOW */}
          <div style={styles.chatBox}>
            {/* Welcome message if no messages */}
            {messages.length === 0 && (
              <div style={styles.welcomeContainer}>
                <span style={styles.welcomeIcon}>👋</span>
                <p style={styles.welcomeText}>
                  Hi! I'm your AI assistant. Tell me where you want to go or what you need help with.
                </p>
                <div style={styles.suggestionChips}>
                  <button style={styles.chip} onClick={() => setInput("show dashboard")}>📊 Dashboard</button>
                  <button style={styles.chip} onClick={() => setInput("health check")}>🏥 Health Check</button>
                  <button style={styles.chip} onClick={() => setInput("show map")}>🗺️ City Map</button>
                  <button style={styles.chip} onClick={() => setInput("help")}>❓ Help</button>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  ...styles.messageRow,
                  justifyContent: m.sender === "user" ? "flex-end" : "flex-start"
                }}
              >
                {m.sender === "bot" && (
                  <span style={styles.botAvatar}>🤖</span>
                )}
                <div
                  style={{
                    ...styles.message,
                    ...(m.sender === "user" ? styles.userMessage : styles.botMessage)
                  }}
                >
                  {m.emoji && m.sender === "bot" && (
                    <span style={styles.messageEmoji}>{m.emoji}</span>
                  )}
                  <span>{m.text}</span>
                </div>
                {m.sender === "user" && (
                  <span style={styles.userAvatar}>👤</span>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={styles.messageRow}>
                <span style={styles.botAvatar}>🤖</span>
                <div style={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT AREA */}
          <div style={styles.inputContainer}>
            <input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              style={styles.input}
            />
            
            <button 
              onClick={startVoice}
              style={{
                ...styles.voiceButton,
                ...(isListening ? styles.voiceButtonActive : {})
              }}
              title="Voice input"
            >
              🎤
            </button>

            <button 
              onClick={handleSend}
              style={styles.sendButton}
              disabled={!input.trim()}
              title="Send message"
            >
              📤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* MODERN STYLES */
const styles = {
  floating: {
  position: "fixed",
  bottom: 24,
  right: 24,
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  border: "none",
  fontSize: "26px",
  cursor: "pointer",
  zIndex: 999,
  boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease"
},
  floatingActive: {
    background: "#f44336",
    boxShadow: "0 4px 15px rgba(244, 67, 54, 0.4)",
    padding: "12px",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    justifyContent: "center"
  },
  floatingIcon: {
    fontSize: "20px"
  },
  floatingText: {
    fontSize: "14px"
  },
  panel: {
    position: "fixed",
    bottom: 90,
    right: 24,
    width: 360,
    height: 500,
    background: "#ffffff",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
    zIndex: 999,
    overflow: "hidden",
    animation: "slideIn 0.3s ease"
  },
  header: {
    padding: "16px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  headerIcon: {
    fontSize: "28px"
  },
  headerTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 600
  },
  headerSubtitle: {
    margin: 0,
    fontSize: "12px",
    opacity: 0.9
  },
  closeButton: {
    background: "rgba(255, 255, 255, 0.2)",
    border: "none",
    color: "white",
    width: 32,
    height: 32,
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    transition: "all 0.2s"
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "#f8f9fa"
  },
  welcomeContainer: {
    textAlign: "center",
    padding: "20px 10px"
  },
  welcomeIcon: {
    fontSize: "48px",
    display: "block",
    marginBottom: "12px"
  },
  welcomeText: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "16px",
    lineHeight: 1.5
  },
  suggestionChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    justifyContent: "center"
  },
  chip: {
    padding: "8px 12px",
    background: "white",
    border: "1px solid #e0e0e0",
    borderRadius: "20px",
    fontSize: "12px",
    color: "#667eea",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px"
  },
  message: {
    maxWidth: "70%",
    padding: "10px 14px",
    borderRadius: "14px",
    fontSize: "14px",
    lineHeight: 1.4,
    wordWrap: "break-word",
    position: "relative",
    animation: "fadeIn 0.3s ease"
  },
  userMessage: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderBottomRightRadius: "4px"
  },
  botMessage: {
    background: "white",
    color: "#333",
    borderBottomLeftRadius: "4px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
  },
  messageEmoji: {
    marginRight: "6px"
  },
  botAvatar: {
    width: 28,
    height: 28,
    background: "#e0e0e0",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px"
  },
  userAvatar: {
    width: 28,
    height: 28,
    background: "#667eea",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    color: "white"
  },
  typingIndicator: {
    background: "white",
    padding: "12px 16px",
    borderRadius: "14px",
    borderBottomLeftRadius: "4px",
    display: "flex",
    gap: "4px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
  },
  inputContainer: {
    padding: "16px",
    background: "white",
    borderTop: "1px solid #f0f0f0",
    display: "flex",
    gap: "8px",
    alignItems: "center"
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    border: "1px solid #e0e0e0",
    borderRadius: "25px",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s"
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "none",
    background: "#f0f0f0",
    color: "#666",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    transition: "all 0.2s"
  },
  voiceButtonActive: {
    background: "#f44336",
    color: "white",
    animation: "pulse 1.5s infinite"
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    transition: "all 0.2s"
  }
};

// Add keyframe animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .typing-indicator span {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #667eea;
    margin: 0 2px;
    animation: bounce 1.5s infinite ease-in-out;
  }
  
  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes bounce {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-10px);
    }
  }
`;
document.head.appendChild(style);