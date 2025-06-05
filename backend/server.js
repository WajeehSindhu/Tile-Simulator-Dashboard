const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const tileRoutes = require('./routes/tileRoute');
const tileCategoryRoutes = require("./routes/tileCategoryRoutes");
const tileColorRoutes = require("./routes/tileColorRoutes")
dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/tiles', tileRoutes);
app.use('/api', authRoutes);
app.use("/api", tileCategoryRoutes);
app.use("/api/colors", tileColorRoutes);

app.get("/", (req, res) => {
  res.send("Backend is live!");
});



mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));
