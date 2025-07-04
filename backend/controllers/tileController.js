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

    // Validate background color if provided
    if (backgroundColor) {
      const bgColor = await Color.findById(backgroundColor);
      if (!bgColor) {
        return res.status(400).json({ 
          error: "Invalid background color selected",
          details: "The selected background color does not exist in the database"
        });
      }
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

    // Validate border color if provided
    if (req.body.borderColor) {
      const borderColorObj = await Color.findById(req.body.borderColor);
      if (!borderColorObj) {
        return res.status(400).json({
          error: "Invalid border color selected",
          details: "The selected border color does not exist in the database"
        });
      }
    }

    // Handle border mask upload
    let borderMaskUrl = null;
    let borderMaskPublicId = null;
    if (req.files?.borderMask?.[0]) {
      borderMaskUrl = req.files.borderMask[0].path;
      borderMaskPublicId = req.files.borderMask[0].filename;
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
      backgroundColor: backgroundColor || null, // Allow null for no background
      groutShape,
      shapeStyle,
      scale: parseFloat(scale),
      subMasks,
      borderMask: borderMaskUrl,
      borderMaskPublicId: borderMaskPublicId,
      borderColor: req.body.borderColor || null,
      colorsUsed: [
        ...(backgroundColor ? [backgroundColor] : []),
        ...(req.body.borderColor ? [req.body.borderColor] : []),
        ...tileMaskColors
      ]
    });

    await tile.save();

    const savedTile = await Tile.findById(tile._id)
      .populate("backgroundColor", "hexCode noBackground")
      .populate("category", "name")
      .populate("subMasks.backgroundColor", "hexCode")
      .populate("colorsUsed", "hexCode");
      
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
    if (req.files?.borderMask?.[0]) {
      await deleteFromCloudinary(req.files.borderMask[0].filename);
    }

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

    // Add base URL to image paths if needed
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000/';
    const tilesWithFullUrls = tiles.map(tile => {
      const tileObj = tile.toObject();
      if (tileObj.mainMask && !tileObj.mainMask.startsWith('http')) {
        tileObj.mainMask = baseUrl + tileObj.mainMask.replace(/^\/+/, '');
      }
      if (Array.isArray(tileObj.subMasks)) {
        tileObj.subMasks = tileObj.subMasks.map(mask => ({
          ...mask,
          image: mask.image && !mask.image.startsWith('http') ? baseUrl + mask.image.replace(/^\/+/, '') : mask.image
        }));
      }
      return tileObj;
    });

    res.json(tilesWithFullUrls);
  } catch (error) {
    console.error("Get tiles error:", error);
    res.status(500).json({ error: "Failed to fetch tiles" });
  }
};

exports.getTileById = async (req, res) => {
  try {
    const tile = await Tile.findById(req.params.id)
      .populate("backgroundColor", "_id hexCode")
      .populate("subMasks.backgroundColor", "_id hexCode");

    if (!tile) {
      return res.status(404).json({ error: "Tile not found" });
    }

    // Add base URL to image paths if needed
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000/';
    const tileObj = tile.toObject();
    if (tileObj.mainMask && !tileObj.mainMask.startsWith('http')) {
      tileObj.mainMask = baseUrl + tileObj.mainMask.replace(/^\/+/, '');
    }
    if (Array.isArray(tileObj.subMasks)) {
      tileObj.subMasks = tileObj.subMasks.map(mask => ({
        ...mask,
        image: mask.image && !mask.image.startsWith('http') ? baseUrl + mask.image.replace(/^\/+/, '') : mask.image
      }));
    }

    res.json(tileObj);
  } catch (error) {
    console.error("Get tile error:", error);
    res.status(500).json({ error: "Failed to fetch tile" });
  }
};

exports.getTilesWithColorsUsed = async (req, res) => {
  try {
    const tiles = await Tile.find()
      .populate('backgroundColor') // for main mask
      .populate('subMasks.backgroundColor'); // for sub masks

    const tilesWithColors = tiles.map(tile => {
      const colorsUsedSet = new Set();

      // Add mainMask backgroundColor
      if (tile.backgroundColor?.hex) {
        colorsUsedSet.add(tile.backgroundColor.hex);
      }

      // Add each subMask's backgroundColor
      tile.subMasks.forEach(mask => {
        if (mask.backgroundColor?.hex) {
          colorsUsedSet.add(mask.backgroundColor.hex);
        }
      });

      return {
        ...tile.toObject(),
        colorsUsed: Array.from(colorsUsedSet)
      };
    });

    res.status(200).json(tilesWithColors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tiles" });
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

    // Create update object with existing data
    const updateData = {
      tileName: tileName || tile.tileName,
      category: category || tile.category,
      backgroundColor: backgroundColor || null, // Allow null for no background
      groutShape: groutShape || tile.groutShape,
      shapeStyle: shapeStyle || tile.shapeStyle,
      scale: scale !== undefined ? parseFloat(scale) : tile.scale,
      mainMask: tile.mainMask,
      mainMaskPublicId: tile.mainMaskPublicId,
      subMasks: tile.subMasks,
      borderMask: tile.borderMask,
      borderMaskPublicId: tile.borderMaskPublicId,
      borderColor: tile.borderColor,
      colorsUsed: backgroundColor ? [backgroundColor] : [] // Initialize with main color if provided
    };

    // If there are sub mask colors, add them to colorsUsed
    if (req.body.tileMaskColors) {
      const tileMaskColors = Array.isArray(req.body.tileMaskColors)
        ? req.body.tileMaskColors
        : [req.body.tileMaskColors];
      updateData.colorsUsed = [...updateData.colorsUsed, ...tileMaskColors];
    } else if (tile.subMasks) {
      // If no new colors provided, use existing sub mask colors
      const existingSubMaskColors = tile.subMasks.map(mask => mask.backgroundColor);
      updateData.colorsUsed = [...updateData.colorsUsed, ...existingSubMaskColors];
    }

    // Validate category if provided
    if (category) {
      const tileCategory = await TileCategory.findById(category);
      if (!tileCategory) {
        return res.status(400).json({
          error: "Invalid category selected",
          details: "The selected category does not exist in the database"
        });
      }
    }

    // Validate color if provided
    if (backgroundColor) {
      const color = await Color.findById(backgroundColor);
      if (!color) {
        return res.status(400).json({
          error: "Invalid background color selected",
          details: "The selected background color does not exist in the database"
        });
      }
    }

    // Handle main mask update if new file is uploaded
    if (req.files?.mainMask?.[0]) {
      // Delete old main mask from Cloudinary
      if (tile.mainMaskPublicId) {
        await deleteFromCloudinary(tile.mainMaskPublicId);
      }
      updateData.mainMask = req.files.mainMask[0].path;
      updateData.mainMaskPublicId = req.files.mainMask[0].filename;
    }

    // Handle submasks update if new files or colors are provided
    if (req.files?.tileMasks || req.body.tileMaskColors || req.body.deletedSubMasks) {
      const tileMasks = req.files?.tileMasks || [];
      const tileMaskColors = Array.isArray(req.body.tileMaskColors)
        ? req.body.tileMaskColors
        : req.body.tileMaskColors
        ? [req.body.tileMaskColors]
        : [];
      
      // Handle deleted submasks
      const deletedSubMasks = Array.isArray(req.body.deletedSubMasks)
        ? req.body.deletedSubMasks
        : req.body.deletedSubMasks
        ? [req.body.deletedSubMasks]
        : [];

      // Delete removed submasks from Cloudinary
      if (deletedSubMasks.length > 0) {
        for (const maskId of deletedSubMasks) {
          const maskToDelete = tile.subMasks.find(mask => mask._id.toString() === maskId);
          if (maskToDelete && maskToDelete.publicId) {
            await deleteFromCloudinary(maskToDelete.publicId);
          }
        }
      }

      // If new masks are uploaded
      if (tileMasks.length > 0) {
        // For new uploads, validate that each mask has a corresponding color
        if (tileMaskColors.length < tileMasks.length) {
          // Clean up any newly uploaded files
          for (const mask of tileMasks) {
            await deleteFromCloudinary(mask.filename);
          }
          return res.status(400).json({
            error: "Mismatched masks and colors",
            details: `Each new mask must have a corresponding color. Found ${tileMasks.length} new masks but only ${tileMaskColors.length} colors.`
          });
        }

        // Validate color IDs for new masks
        for (let i = 0; i < tileMasks.length; i++) {
          const colorId = tileMaskColors[i];
          const exists = await Color.findById(colorId);
          if (!exists) {
            // Clean up any newly uploaded files
            for (const mask of tileMasks) {
              await deleteFromCloudinary(mask.filename);
            }
            return res.status(400).json({
              error: "Invalid sub mask color selected",
              details: `Color ID ${colorId} does not exist in the database`
            });
          }
        }

        // Create new submasks array by combining existing and new submasks
        const existingSubMasks = (tile.subMasks || []).filter(mask => 
          !deletedSubMasks.includes(mask._id.toString())
        );

        // Get the colors for existing masks
        const existingMaskColors = existingSubMasks.map(mask => mask.backgroundColor);

        // Create new submasks with their corresponding colors
        const newSubMasks = tileMasks.map((mask, index) => ({
          image: mask.path,
          publicId: mask.filename,
          backgroundColor: tileMaskColors[tileMaskColors.length - tileMasks.length + index] // Get colors for new masks from the end of the array
        }));

        // Combine existing and new submasks
        updateData.subMasks = [...existingSubMasks, ...newSubMasks];
      } else if (tileMaskColors.length > 0 || deletedSubMasks.length > 0) {
        // If only colors are being updated or masks are being deleted (no new files)
        // Filter out deleted masks and update colors for remaining ones
        updateData.subMasks = (tile.subMasks || [])
          .filter(mask => !deletedSubMasks.includes(mask._id.toString()))
          .map((mask, index) => {
            // If we have a new color for this index, use it, otherwise keep the existing color
            const newColor = tileMaskColors[index] || mask.backgroundColor;
            return {
              image: mask.image,
              publicId: mask.publicId,
              backgroundColor: newColor
            };
          });
      }
    }

    // Handle border mask update if new file is uploaded
    if (req.files?.borderMask?.[0]) {
      // Delete old border mask from Cloudinary
      if (tile.borderMaskPublicId) {
        await deleteFromCloudinary(tile.borderMaskPublicId);
      }
      updateData.borderMask = req.files.borderMask[0].path;
      updateData.borderMaskPublicId = req.files.borderMask[0].filename;
    }

    // Handle border color update
    if (req.body.borderColor) {
      updateData.borderColor = req.body.borderColor;
      updateData.colorsUsed = [
        ...(backgroundColor ? [backgroundColor] : []),
        req.body.borderColor,
        ...(req.body.tileMaskColors
          ? (Array.isArray(req.body.tileMaskColors)
              ? req.body.tileMaskColors
              : [req.body.tileMaskColors])
          : tile.subMasks.map(mask => mask.backgroundColor))
      ];
    }

    // Update the tile with all changes
    const updatedTile = await Tile.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true,
        runValidators: true,
        context: 'query'
      }
    ).populate("backgroundColor", "hexCode noBackground")
     .populate("category", "name")
     .populate("subMasks.backgroundColor", "hexCode")
     .populate("colorsUsed", "hexCode");

    if (!updatedTile) {
      return res.status(404).json({ error: "Tile not found after update" });
    }

    res.json(updatedTile);
  } catch (error) {
    console.error("Update tile error:", error);
    
    // Clean up any newly uploaded files if update fails
    if (req.files?.mainMask?.[0]) {
      await deleteFromCloudinary(req.files.mainMask[0].filename);
    }
    if (req.files?.tileMasks) {
      for (const mask of req.files.tileMasks) {
        await deleteFromCloudinary(mask.filename);
      }
    }
    if (req.files?.borderMask?.[0]) {
      await deleteFromCloudinary(req.files.borderMask[0].filename);
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

// Get available grout shapes
exports.getGroutShapes = async (req, res) => {
  try {
    const groutShapes = Tile.schema.path('groutShape').enumValues;
    res.json(groutShapes);
  } catch (error) {
    console.error("Get grout shapes error:", error);
    res.status(500).json({ error: "Failed to fetch grout shapes" });
  }
};

// Get available shape styles
exports.getShapeStyles = async (req, res) => {
  try {
    const shapeStyles = Tile.schema.path('shapeStyle').enumValues;
    res.json(shapeStyles);
  } catch (error) {
    console.error("Get shape styles error:", error);
    res.status(500).json({ error: "Failed to fetch shape styles" });
  }
};

// Get scale range configuration
exports.getScaleRange = async (req, res) => {
  try {
    const scalePath = Tile.schema.path('scale');
    const scaleRange = {
      min: scalePath.options.min,
      max: scalePath.options.max,
      step: 0.1 // We can keep this as a constant since it's not in the schema
    };
    res.json(scaleRange);
  } catch (error) {
    console.error("Get scale range error:", error);
    res.status(500).json({ error: "Failed to fetch scale range" });
  }
};
