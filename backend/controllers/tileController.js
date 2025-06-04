const Tile = require("../models/tile");
const Color = require("../models/tileColor");
const TileCategory = require("../models/tileCategory");

// Cloudinary helper
const { deleteFromCloudinary } = require("../utils/fileHelper");

exports.createTile = async (req, res) => {
  try {
    const {
      tileName,
      category,
      backgroundColor,
      groutShape,
      shapeStyle,
      scale,
    } = req.body;

    // Validate required fields
    if (!tileName) {
      return res.status(400).json({ error: "Tile name is required" });
    }

    // Validate category
    const tileCategory = await TileCategory.findById(category);
    if (!tileCategory) {
      return res.status(400).json({ 
        error: "Invalid category selected",
        details: "The selected category does not exist in the database"
      });
    }

    // Validate background color
    const bgColor = await Color.findById(backgroundColor);
    if (!bgColor) {
      return res.status(400).json({ 
        error: "Invalid background color selected",
        details: "The selected background color does not exist in the database"
      });
    }

    // Validate main mask
    if (!req.files?.mainMask?.[0]) {
      return res.status(400).json({ 
        error: "Main mask image is required",
        details: "Please upload a main mask image"
      });
    }

    const mainMaskUrl = req.files.mainMask[0].path;
    const mainMaskPublicId = req.files.mainMask[0].filename;

    // Sub mask handling
    const tileMasks = req.files.tileMasks || [];
    const tileMaskColors = Array.isArray(req.body.tileMaskColors)
      ? req.body.tileMaskColors
      : req.body.tileMaskColors
      ? [req.body.tileMaskColors]
      : [];

    // Validate matching number of masks and colors
    if (tileMasks.length !== tileMaskColors.length) {
      // Clean up the uploaded main mask
      await deleteFromCloudinary(mainMaskPublicId);
      
      return res.status(400).json({
        error: "Mismatched masks and colors",
        details: `Number of tile masks (${tileMasks.length}) does not match number of colors (${tileMaskColors.length})`
      });
    }

    // Validate sub mask color IDs
    for (const colorId of tileMaskColors) {
      const exists = await Color.findById(colorId);
      if (!exists) {
        // Clean up the uploaded main mask
        await deleteFromCloudinary(mainMaskPublicId);
        
        return res.status(400).json({
          error: "Invalid sub mask color selected",
          details: `Color ID ${colorId} does not exist in the database`
        });
      }
    }

    // Construct sub mask array
    const subMasks = tileMasks.map((mask, index) => ({
      image: mask.path,
      publicId: mask.filename,
      backgroundColor: tileMaskColors[index]
    }));

    const tile = new Tile({
      tileName,
      category,
      mainMask: mainMaskUrl,
      mainMaskPublicId,
      backgroundColor,
      groutShape,
      shapeStyle,
      scale: parseFloat(scale),
      subMasks,
    });

    await tile.save();

    const savedTile = await Tile.findById(tile._id)
      .populate("backgroundColor", "hexCode")
      .populate("category", "name")
      .populate("subMasks.backgroundColor", "hexCode");

    res.status(201).json(savedTile);
  } catch (error) {
    console.error("Create tile error:", error);
    
    // Clean up any uploaded images if tile creation fails
    if (req.files?.mainMask?.[0]) {
      await deleteFromCloudinary(req.files.mainMask[0].filename);
    }
    if (req.files?.tileMasks) {
      for (const mask of req.files.tileMasks) {
        await deleteFromCloudinary(mask.filename);
      }
    }

    // Send detailed error message
    res.status(500).json({ 
      error: "Failed to create tile",
      details: error.message || "An unexpected error occurred while creating the tile"
    });
  }
};

exports.getTiles = async (req, res) => {
  try {
    const tiles = await Tile.find()
      .populate("backgroundColor", "hexCode")
      .populate("category", "name")
      .populate("subMasks.backgroundColor", "hexCode")
      .sort("-createdAt");

    res.json(tiles);
  } catch (error) {
    console.error("Get tiles error:", error);
    res.status(500).json({ error: "Failed to fetch tiles" });
  }
};

exports.getTileById = async (req, res) => {
  try {
    const tile = await Tile.findById(req.params.id)
      .populate("backgroundColor", "hexCode")
      .populate("subMasks.backgroundColor", "hexCode")
      .select("-mainMask -subMasks.image");

    if (!tile) {
      return res.status(404).json({ error: "Tile not found" });
    }

    res.json(tile);
  } catch (error) {
    console.error("Get tile error:", error);
    res.status(500).json({ error: "Failed to fetch tile" });
  }
};

exports.updateTile = async (req, res) => {
  try {
    const {
      tileName,
      category,
      backgroundColor,
      groutShape,
      shapeStyle,
      scale,
    } = req.body;

    // Find the existing tile
    const tile = await Tile.findById(req.params.id);
    if (!tile) {
      return res.status(404).json({ error: "Tile not found" });
    }

    // Only validate category if it's being updated
    if (category) {
      const tileCategory = await TileCategory.findById(category);
      if (!tileCategory) {
        return res.status(400).json({
          error: "Invalid category selected",
          details: "The selected category does not exist in the database"
        });
      }
      tile.category = category;
    }

    // Only validate backgroundColor if it's being updated
    if (backgroundColor) {
      const color = await Color.findById(backgroundColor);
      if (!color) {
        return res.status(400).json({
          error: "Invalid background color selected",
          details: "The selected background color does not exist in the database"
        });
      }
      tile.backgroundColor = backgroundColor;
    }

    // Update mainMask if provided
    if (req.files?.mainMask?.[0]) {
      // Delete old main mask from Cloudinary
      if (tile.mainMaskPublicId) {
        await deleteFromCloudinary(tile.mainMaskPublicId);
      }
      tile.mainMask = req.files.mainMask[0].path;
      tile.mainMaskPublicId = req.files.mainMask[0].filename;
    }

    // Update subMasks if new masks are provided
    if (req.files?.tileMasks || req.body.tileMaskColors) {
      const tileMasks = req.files.tileMasks || [];
      const tileMaskColors = Array.isArray(req.body.tileMaskColors)
        ? req.body.tileMaskColors
        : req.body.tileMaskColors
        ? [req.body.tileMaskColors]
        : [];

      // Validate colors if new masks are being added
      if (tileMasks.length > 0) {
        // Validate matching number of masks and colors
        if (tileMasks.length !== tileMaskColors.length) {
          return res.status(400).json({
            error: "Mismatched masks and colors",
            details: `Number of tile masks (${tileMasks.length}) does not match number of colors (${tileMaskColors.length})`
          });
        }

        // Validate color IDs
        for (const colorId of tileMaskColors) {
          const exists = await Color.findById(colorId);
          if (!exists) {
            return res.status(400).json({
              error: "Invalid sub mask color selected",
              details: `Color ID ${colorId} does not exist in the database`
            });
          }
        }

        // Delete old submasks from Cloudinary
        for (const mask of tile.subMasks) {
          if (mask.publicId) {
            await deleteFromCloudinary(mask.publicId);
          }
        }

        // Create new submasks array
        tile.subMasks = tileMasks.map((mask, index) => ({
          image: mask.path,
          publicId: mask.filename,
          backgroundColor: tileMaskColors[index]
        }));
      }
    }

    // Update other fields if provided
    if (tileName) tile.tileName = tileName;
    if (groutShape) tile.groutShape = groutShape;
    if (shapeStyle) tile.shapeStyle = shapeStyle;
    if (scale !== undefined) tile.scale = parseFloat(scale);

    // Save the updated tile
    await tile.save();

    // Fetch the updated tile with populated fields
    const updatedTile = await Tile.findById(tile._id)
      .populate("backgroundColor", "hexCode")
      .populate("category", "name")
      .populate("subMasks.backgroundColor", "hexCode");

    res.json(updatedTile);
  } catch (error) {
    console.error("Update tile error:", error);
    
    // Clean up any newly uploaded images if update fails
    if (req.files?.mainMask?.[0]) {
      await deleteFromCloudinary(req.files.mainMask[0].filename);
    }
    if (req.files?.tileMasks) {
      for (const mask of req.files.tileMasks) {
        await deleteFromCloudinary(mask.filename);
      }
    }

    res.status(500).json({
      error: "Failed to update tile",
      details: error.message || "An unexpected error occurred while updating the tile"
    });
  }
};

exports.deleteTile = async (req, res) => {
  try {
    const tile = await Tile.findById(req.params.id);
    if (!tile) {
      return res.status(404).json({ error: "Tile not found" });
    }
    if (tile.mainMask) {
      await deleteFromCloudinary(tile.mainMask);
    }
    for (const mask of tile.subMasks || []) {
      if (mask.image) {
        await deleteFromCloudinary(mask.image);
      }
    }

    await tile.deleteOne();
    res.json({ message: "Tile deleted successfully" });
  } catch (error) {
    console.error("Delete tile error:", error);
    res.status(500).json({ error: "Failed to delete tile" });
  }
};
