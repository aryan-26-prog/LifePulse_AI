const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

/* ================= LOAD ENV ================= */
dotenv.config();

/* ================= START SERVER ================= */
const startServer = async () => {
  try {

    /* ⭐ CONNECT DATABASE FIRST */
    await connectDB();

    const app = express();

    /* ================= MIDDLEWARE ================= */
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/uploads", express.static("uploads"));
    app.use(express.static("uploads"));

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

    /* ================= CREATE HTTP SERVER ================= */
    const server = http.createServer(app);

    /* ================= SOCKET.IO SETUP ================= */
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    /* ⭐ MAKE IO GLOBAL */
    app.set("io", io);

    /* ================= SOCKET EVENTS ================= */
    io.on("connection", (socket) => {

      console.log("⚡ Socket Connected:", socket.id);

      /* Volunteer Join */
      socket.on("joinVolunteer", (volunteerId) => {
        socket.join(volunteerId);
        console.log("Volunteer joined room:", volunteerId);
      });

      /* NGO Join */
      socket.on("joinNGO", () => {
        socket.join("ngoRoom");
        console.log("NGO joined room");
      });

      socket.on("disconnect", () => {
        console.log("❌ Socket Disconnected:", socket.id);
      });

    });

    /* ================= START SERVER ================= */
    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

/* ================= START APP ================= */
startServer();
