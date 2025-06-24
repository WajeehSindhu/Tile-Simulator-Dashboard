const express = require("express");
const router = express.Router();
const TileCategory = require("../models/tileCategory");
const Tile = require("../models/tile");
const upload = require("../middleware/upload");

// POST
router.post("/categories",
  upload.fields([
    { name: "mainBorderMask", maxCount: 1 },
    { name: "borderMasks", maxCount: 10 }
  ]),
  async (req, res) => {
    try {
      const { name, description, isBorderCategory } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });

      let mainBorderMask = null;
      let mainBorderMaskPublicId = null;
      if (req.files?.mainBorderMask?.[0]) {
        mainBorderMask = req.files.mainBorderMask[0].path;
        mainBorderMaskPublicId = req.files.mainBorderMask[0].filename;
      }

      // Handle border masks
      const borderMasksFiles = req.files.borderMasks || [];
      const borderMaskColors = Array.isArray(req.body.borderMaskColors)
        ? req.body.borderMaskColors
        : req.body.borderMaskColors
        ? [req.body.borderMaskColors]
        : [];
      const borderMasks = borderMasksFiles.map((file, idx) => ({
        image: file.path,
        publicId: file.filename,
        color: borderMaskColors[idx] || null
      }));

      const category = new TileCategory({
        name,
        description,
        isBorderCategory: isBorderCategory === 'true' || isBorderCategory === true,
        mainBorderMask,
        mainBorderMaskPublicId,
        borderMasks
      });
      await category.save();
      res.status(201).json(category);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /api/categories - Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await TileCategory.find().sort({ createdAt: -1 });
    
    // Get tile counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const tileCount = await Tile.countDocuments({ category: category._id });
        return {
          ...category.toObject(),
          tileCount
        };
      })
    );

    res.json(categoriesWithCounts);
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
router.put("/categories/:id",
  upload.fields([
    { name: "mainBorderMask", maxCount: 1 },
    { name: "borderMasks", maxCount: 10 }
  ]),
  async (req, res) => {
    try {
      const { name, description, isBorderCategory } = req.body;
      const updateData = { name, description };
      if (typeof isBorderCategory !== 'undefined') {
        updateData.isBorderCategory = isBorderCategory === 'true' || isBorderCategory === true;
      }
      if (req.files?.mainBorderMask?.[0]) {
        updateData.mainBorderMask = req.files.mainBorderMask[0].path;
        updateData.mainBorderMaskPublicId = req.files.mainBorderMask[0].filename;
      }
      // Handle border masks
      const borderMasksFiles = req.files.borderMasks || [];
      const borderMaskColors = Array.isArray(req.body.borderMaskColors)
        ? req.body.borderMaskColors
        : req.body.borderMaskColors
        ? [req.body.borderMaskColors]
        : [];
      if (borderMasksFiles.length > 0) {
        updateData.borderMasks = borderMasksFiles.map((file, idx) => ({
          image: file.path,
          publicId: file.filename,
          color: borderMaskColors[idx] || null
        }));
      }
      const updatedCategory = await TileCategory.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      if (!updatedCategory)
        return res.status(404).json({ message: "Category not found" });
      res.json(updatedCategory);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
