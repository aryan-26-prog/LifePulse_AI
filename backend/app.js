const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("LifePulse AI  Backend is running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/health", require("./routes/healthRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/public", require("./routes/publicRoutes"));
app.use("/api/ngo", require("./routes/ngoRoutes"));
app.use("/api/volunteers", require("./routes/volunteerRoutes"));
app.use("/api/work-report", require("./routes/workReportRoutes"));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
