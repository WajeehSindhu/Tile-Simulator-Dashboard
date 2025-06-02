const express = require("express");
const router = express.Router();
const TileCategory = require("../models/tileCategory");

// POST
router.post("/categories", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const category = new TileCategory({ name, description });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/categories - Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await TileCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/categories/:id - Delete a category
router.delete("/categories/:id", async (req, res) => {
  try {
    const deleted = await TileCategory.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/categories/:id - Update a category
router.put("/categories/:id", async (req, res) => {
  try {
    const { name, description } = req.body;
    const updatedCategory = await TileCategory.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updatedCategory)
      return res.status(404).json({ message: "Category not found" });

    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
