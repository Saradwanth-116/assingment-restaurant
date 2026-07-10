const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const path = require("path");

const app = express();

// Middleware
// In production, we allow all origins, or we could just allow the specific frontend URL if hosted separately.
app.use(cors());
app.use(express.json());

// Vercel Serverless Database Connection Logic
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB Connected (Vercel Serverless)");
  } catch (err) {
    console.error("Fatal Error: Could not connect to MongoDB", err);
    throw err;
  }
};

// Ensure DB connects before handling any API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: "Database Connection Error" });
  }
});

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tables", require("./routes/tables"));
app.use("/api/reservations", require("./routes/reservations"));

// Serve frontend static files in production (only if not on Vercel)
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, "../dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
