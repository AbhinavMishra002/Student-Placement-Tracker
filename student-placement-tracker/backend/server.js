const express = require("express");
const cors = require("cors");

const studentsRouter = require("./routes/students");
const companiesRouter = require("./routes/companies");
const applicationsRouter = require("./routes/applications");
const interviewsRouter = require("./routes/interviews");
const placementsRouter = require("./routes/placements");
const dashboardRouter = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Student Placement Tracker API is running" });
});

app.use("/api/students", studentsRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/interviews", interviewsRouter);
app.use("/api/placements", placementsRouter);
app.use("/api/dashboard", dashboardRouter);

// Fallback 404 handler for unmatched API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Placement Tracker API running at http://localhost:${PORT}`);
});
