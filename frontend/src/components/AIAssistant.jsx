import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function AIAssistant() {

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  /* SMART INTENT ENGINE */

  const commands = [

    /* AUTH */
    {
      keywords: ["login", "sign in"],
      route: "/login",
      reply: "Opening login page..."
    },
    {
      keywords: ["register", "signup", "sign up"],
      route: "/register",
      reply: "Opening registration..."
    },
    {
      keywords: ["verify otp", "otp verification"],
      route: "/verify-otp",
      reply: "Opening OTP verification..."
    },

    /* ROLE SELECT */
    {
      keywords: ["select role", "choose role"],
      route: "/select-role",
      reply: "Opening role selection..."
    },

    /* ===== CITIZEN FLOW ===== */

    {
      keywords: ["health check", "check health", "checkin"],
      route: "/citizen/checkin",
      reply: "Opening health check-in..."
    },
    {
      keywords: ["processing", "analyzing"],
      route: "/citizen/analyzing",
      reply: "Opening analysis screen..."
    },
    {
      keywords: ["city map", "risk map", "map"],
      route: "/citizen/map",
      reply: "Opening city risk map..."
    },

    /* ===== VOLUNTEER ===== */

    {
      keywords: ["volunteer dashboard"],
      route: "/volunteer",
      reply: "Opening volunteer dashboard..."
    },
    {
      keywords: ["volunteer profile", "my profile", "profile"],
      route: "/volunteer/profile",
      reply: "Opening your profile..."
    },

    /* ===== NGO ===== */

    {
      keywords: ["ngo dashboard"],
      route: "/ngo",
      reply: "Opening NGO dashboard..."
    },
    {
      keywords: ["camp map", "ngo camp map"],
      route: "/ngo/camp-map",
      reply: "Opening camp map..."
    },

    /* ===== ADMIN ===== */

    {
      keywords: ["admin dashboard"],
      route: "/admin",
      reply: "Opening admin dashboard..."
    },
    {
      keywords: ["ngo management", "manage ngos"],
      route: "/admin/ngos",
      reply: "Opening NGO management..."
    },
    {
      keywords: ["analytics", "reports analytics"],
      route: "/admin/analytics",
      reply: "Opening analytics dashboard..."
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

    const command = detectCommand(input);

    if (command) {

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: command.reply }
      ]);

      setTimeout(() => {
        navigate(command.route);
      }, 1000);

    } else {

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Sorry, I didn't understand." }
      ]);
    }

    setInput("");
  };

  /* ULTRA VOICE ENGINE */

  const startVoice = () => {

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {

      const speech = event.results[0][0].transcript;

      setInput(speech);

      const command = detectCommand(speech);

      setMessages(prev => [
        ...prev,
        { sender: "user", text: speech }
      ]);

      if (command) {

        setMessages(prev => [
          ...prev,
          { sender: "bot", text: command.reply }
        ]);

        setTimeout(() => navigate(command.route), 1000);

      } else {

        setMessages(prev => [
          ...prev,
          { sender: "bot", text: "Command not recognized" }
        ]);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  /* UI */

  return (
    <div>

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        style={styles.floating}
      >
        🤖
      </button>

      {/* CHAT PANEL */}
      {open && (
        <div style={styles.panel}>

          <h4>LifePulse AI</h4>

          {/* CHAT WINDOW */}
          <div style={styles.chatBox}>

            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  ...styles.msg,
                  alignSelf:
                    m.sender === "user"
                      ? "flex-end"
                      : "flex-start",
                  background:
                    m.sender === "user"
                      ? "#4CAF50"
                      : "#eee",
                  color:
                    m.sender === "user"
                      ? "white"
                      : "black"
                }}
              >
                {m.text}
              </div>
            ))}

          </div>

          {/* INPUT */}
          <div style={styles.inputRow}>

            <input
              placeholder="Ask LifePulse AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={styles.input}
            />

            <button onClick={handleSend}>Send</button>

            <button onClick={startVoice}>
              🎤
            </button>

          </div>

        </div>
      )}
    </div>
  );
}

/* STYLES */

const styles = {

  floating: {
    position: "fixed",
    bottom: 20,
    right: 20,
    padding: 15,
    borderRadius: "50%",
    background: "#4CAF50",
    color: "white",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    zIndex: 999
  },

  panel: {
    position: "fixed",
    bottom: 80,
    right: 20,
    width: 320,
    height: 420,
    background: "white",
    borderRadius: 12,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 0 15px rgba(0,0,0,0.2)",
    zIndex: 999
  },

  chatBox: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 10
  },

  msg: {
    padding: 8,
    borderRadius: 10,
    maxWidth: "70%"
  },

  inputRow: {
    display: "flex",
    gap: 6
  },

  input: {
    flex: 1,
    padding: 6
  }
};
