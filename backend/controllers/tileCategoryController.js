const TileCategory = require("../models/tileCategory");

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
    res.json(categories);
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
