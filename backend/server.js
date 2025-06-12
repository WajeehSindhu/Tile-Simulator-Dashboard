const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const fetch = require("node-fetch");

const authRoutes = require("./routes/authRoutes");
const tileRoutes = require("./routes/tileRoute");
const tileCategoryRoutes = require("./routes/tileCategoryRoutes");
const tileColorRoutes = require("./routes/tileColorRoutes");

dotenv.config();

const app = express();

// CORS config
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://live-tiledashboard.vercel.app",
      "https://frontend-live-oi6a.vercel.app",
      "https://frontend-live-yxbt.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Allow-Origin"
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    exposedHeaders: ["Content-Range", "X-Content-Range"]
  })
);

// Add additional CORS headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Log non-GET requests
app.use((req, res, next) => {
  if (req.method !== "GET") {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

app.use(express.json());

// Test route to check deployment
app.get("/test", (req, res) => {
  res.send("Test route is working!");
});

// Route to get backend's outgoing IP
app.get("/my-ip", async (req, res) => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    res.json({ ip: data.ip });
  } catch (error) {
    res.status(500).json({ error: "Failed to get IP" });
  }
});

// API routes
app.use("/api/tiles", tileRoutes);
app.use("/api", authRoutes);
app.use("/api", tileCategoryRoutes);
app.use("/api/colors", tileColorRoutes);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
