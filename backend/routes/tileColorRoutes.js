const express = require("express");
const router = express.Router();
const Color = require('../models/tileColor');
// Add a new color
router.post("/add", async (req, res) => {
  const { hexCode } = req.body;
  try {
    const newColor = new Color({ hexCode });
    await newColor.save();
    res.status(201).json(newColor);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      res.status(400).json({ error: "This color already exists" });
    } else {
      res.status(500).json({ error: "Failed to add color" });
    }
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
// Delete a color
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Color.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Color not found" });
    }
    res.status(200).json({ message: "Color deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete color" });
  }
});
// Update a color
router.put("/:id", async (req, res) => {
  try {
    const { hexCode } = req.body;
    const updated = await Color.findByIdAndUpdate(
      req.params.id,
      { hexCode },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Color not found" });
    }
    res.status(200).json(updated);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      res.status(400).json({ error: "This color already exists" });
    } else {
      res.status(500).json({ error: "Failed to update color" });
    }
  }
});
module.exports = router;