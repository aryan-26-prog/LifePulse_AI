const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

/* ================= LOAD ENV ================= */
dotenv.config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(express.static("uploads"));

/* ⭐ CONNECT DB MIDDLEWARE FOR SERVERLESS / VERCEL */
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: "Database Connection Error", error: err.message });
  }
});

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("🚀 LifePulse AI Backend Running");
});

/* ================= ROUTES ================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/health", require("./routes/healthRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/public", require("./routes/publicRoutes"));
app.use("/api/ngo", require("./routes/ngoRoutes"));
app.use("/api/volunteers", require("./routes/volunteerRoutes"));
app.use("/api/work-report", require("./routes/workReportRoutes"));

/* ================= CREATE HTTP & SOCKET SERVER ================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡ Socket Connected:", socket.id);

  socket.on("joinVolunteer", (volunteerId) => {
    socket.join(volunteerId);
    console.log("Volunteer joined room:", volunteerId);
  });

  socket.on("joinNGO", () => {
    socket.join("ngoRoom");
    console.log("NGO joined room");
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket Disconnected:", socket.id);
  });
});

/* ================= START SERVER LOCALLY ================= */
const PORT = process.env.PORT || 5000;

if (require.main === module || !process.env.VERCEL) {
  connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error("❌ DB Startup Error:", err.message);
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT} (DB Connection Pending)`);
    });
  });
}

module.exports = app;
