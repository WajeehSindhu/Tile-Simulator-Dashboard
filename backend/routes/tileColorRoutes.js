const express = require("express");
const router = express.Router();
const Color = require('../models/tileColor');
// Add a new color
router.post("/add", async (req, res) => {
  const { name, hexCode } = req.body;
  try {
    const newColor = new Color({ name, hexCode });
    await newColor.save();
    res.status(201).json(newColor);
  } catch (error) {
    res.status(500).json({ error: "Failed to add color" });
  }
});
// Get all colors
router.get("/", async (req, res) => {
  try {
    const colors = await Color.find();
    res.status(200).json(colors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch colors" });
  }
});
module.exports = router;