import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import "../../styles/form.css";

export default function HealthCheckin() {
  const navigate = useNavigate();

  const recognitionRef = useRef(null);
  const stepRef = useRef("sleep");
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Click voice button to start");
  const [location, setLocation] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [formData, setFormData] = useState({
    sleep: "",
    stress: "",
    symptoms: "",
    area: ""
  });

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
    recognition.continuous = false; // Changed to false
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
        // This is normal when we stop it manually
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
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Give a small delay to ensure recognition stops properly
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

        // Ensure recognition is stopped before speaking
        if (recognitionRef.current && isListening) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.log("Already stopped");
          }
        }

        // Small delay before speaking
        setTimeout(() => {
          window.speechSynthesis.speak(msg);
        }, 100);
      }, 200);
    });
  };

  // Start recognition after speaking
  const startRecognition = () => {
    if (!recognitionRef.current) return;
    
    // Ensure speech is done
    if (isSpeaking) {
      setTimeout(startRecognition, 300);
      return;
    }
    
    try {
      // Stop any existing recognition first
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore if already stopped
        }
      }
      
      // Wait a bit before starting
      setTimeout(() => {
        if (recognitionRef.current && stepRef.current !== "done") {
          recognitionRef.current.start();
          setStatus(`Listening for ${stepRef.current}... Say your response.`);
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
    
    // Stop recognition while processing
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
        await voiceSubmit(updatedData);
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
      return;
    }

    try {
      stepRef.current = "sleep";
      setStatus("Starting voice check-in...");

      // Clear any existing speech
      window.speechSynthesis.cancel();
      
      // Stop any existing recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }

      // Start with speaking first
      await speak("Welcome to voice health check-in. Please tell me how many hours you slept last night.");
      
      // Then start recognition
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

  // Submit data
  const voiceSubmit = async (data) => {
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
      await speak("Sorry, there was an error submitting your data. Please try again.");
    }
  };

  // Manual form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    await voiceSubmit(formData);
  };

  // Handle manual input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!location) {
    return <div className="form"><p>Getting your location...</p></div>;
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Daily Health Check-in</h2>
      
      <div className="voice-section">
        <div className={`status ${isListening ? "listening" : ""} ${isSpeaking ? "speaking" : ""}`}>
          Status: {status}
          {isListening && " 🎤 Listening..."}
          {isSpeaking && " 🔊 Speaking..."}
        </div>
        
        <div className="voice-buttons">
          <button
            type="button"
            onClick={startVoiceCheckin}
            disabled={isListening || isSpeaking}
            className="voice-btn"
          >
            {isListening ? "🎤 Listening..." : isSpeaking ? "🔊 Speaking..." : "🎤 Start Voice Check-in"}
          </button>
          
          {(isListening || isSpeaking) && (
            <button
              type="button"
              onClick={stopListening}
              className="stop-btn"
            >
              Stop
            </button>
          )}
        </div>
        
        <div className="current-step">
          Current step: <strong>{stepRef.current.toUpperCase()}</strong>
        </div>
        
        <div className="step-instructions">
          {stepRef.current === "sleep" && "Say something like '7 hours' or 'I slept 8 hours'"}
          {stepRef.current === "stress" && "Say a number between 0 and 10"}
          {stepRef.current === "symptoms" && "Describe your symptoms"}
          {stepRef.current === "area" && "Say your area name"}
        </div>
      </div>

      <div className="form-fields">
        <div className="form-group">
          <label>Sleep Hours (0-24)</label>
          <input 
            type="number" 
            name="sleep" 
            min="0" 
            max="24"
            value={formData.sleep} 
            onChange={handleChange}
            placeholder="Hours of sleep"
          />
          <span className="field-status">{formData.sleep ? `✓ ${formData.sleep} hours` : ""}</span>
        </div>

        <div className="form-group">
          <label>Stress Level (0-10)</label>
          <input 
            type="number" 
            name="stress" 
            min="0" 
            max="10"
            value={formData.stress} 
            onChange={handleChange}
            placeholder="0 = no stress, 10 = max"
          />
          <span className="field-status">{formData.stress ? `✓ Level ${formData.stress}` : ""}</span>
        </div>

        <div className="form-group">
          <label>Symptoms (comma separated)</label>
          <input 
            type="text" 
            name="symptoms" 
            value={formData.symptoms} 
            onChange={handleChange}
            placeholder="e.g., headache, fever, cough"
          />
          <span className="field-status">{formData.symptoms ? "✓ Recorded" : ""}</span>
        </div>

        <div className="form-group">
          <label>Area/Locality</label>
          <input 
            type="text" 
            name="area" 
            value={formData.area} 
            onChange={handleChange}
            placeholder="Your current area"
          />
          <span className="field-status">{formData.area ? `✓ ${formData.area}` : ""}</span>
        </div>
      </div>

      <button type="submit" className="submit-btn">
        Submit Health Check-in
      </button>

      <div className="instructions">
        <h4>Voice Instructions:</h4>
        <ul>
          <li>Click "Start Voice Check-in" button</li>
          <li>Allow microphone access if prompted</li>
          <li>Wait for the voice prompt to finish</li>
          <li>Speak clearly when you see "Listening..."</li>
          <li>Say numbers for sleep and stress levels</li>
          <li>Describe symptoms in words</li>
          <li>Say your area name clearly</li>
          <li>Click Stop button if needed</li>
        </ul>
      </div>
    </form>
  );
}