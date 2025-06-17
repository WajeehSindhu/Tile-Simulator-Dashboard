const TileCategory = require("../models/tileCategory");
const Tile = require("../models/tile");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = new TileCategory({ name, description });
    await category.save();

    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await TileCategory.find().exec();
    console.log("Found categories:", categories.map(c => ({ id: c._id, name: c.name })));
    
    // Get tile counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const tileCount = await Tile.countDocuments({ category: category._id });
        console.log(`Category ${category.name} (${category._id}) has ${tileCount} tiles`);
        
        // Debug: Get actual tiles for this category
        const tiles = await Tile.find({ category: category._id });
        console.log(`Tiles in category ${category.name}:`, tiles.map(t => ({ id: t._id, name: t.tileName, category: t.category })));
        
        return {
          ...category.toObject(),
          tileCount
        };
      })
    );

    res.json(categoriesWithCounts);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Failed to get categories" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await TileCategory.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};
