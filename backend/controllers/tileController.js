const Tile = require("../addTiles/tile");

const createTile = async (req, res) => {
  try {
    const mask = req.body.mask ? JSON.parse(req.body.mask) : {};

    // Extract uploaded image paths
    const images = req.files ? req.files.map(file => file.path) : [];

    const newTile = new Tile({
      name: req.body.name,
      description: req.body.description,
      mask: {
        backgroundColor: mask.backgroundColor,
        groutShape: mask.groutShape,
        shapeStyle: mask.shapeStyle,
        scale: mask.scale,
        images,
      },
    });

    await newTile.save();
    res.status(201).json(newTile);
  } catch (error) {
    console.error("Create tile error:", error);
    res.status(500).json({ error: "Failed to create tile" });
  }
};

const getTiles = async (req, res) => {
  try {
    const tiles = await Tile.find();
    res.json(tiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createTile, getTiles };
