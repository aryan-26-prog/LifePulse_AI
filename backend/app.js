const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= ROUTES ================= */
app.get("/", (req, res) => {
  res.send("LifePulse AI Backend is running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/health", require("./routes/healthRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/public", require("./routes/publicRoutes"));
app.use("/api/ngo", require("./routes/ngoRoutes"));
app.use("/api/volunteers", require("./routes/volunteerRoutes"));
app.use("/api/work-report", require("./routes/workReportRoutes"));

/* ================= SOCKET SETUP ================= */

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

/* ⭐ SINGLE SOURCE OF TRUTH */
app.set("io", io);

io.on("connection", (socket) => {

  console.log("Socket Connected:", socket.id);

  /* Volunteer joins own room */
  socket.on("joinVolunteer", (volunteerId) => {
    socket.join(volunteerId);
    console.log("Volunteer joined room:", volunteerId);
  });

  /* NGO joins NGO room */
  socket.on("joinNGO", () => {
    socket.join("ngoRoom");
    console.log("NGO joined room");
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
