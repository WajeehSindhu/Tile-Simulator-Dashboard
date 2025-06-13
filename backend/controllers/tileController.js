// const Tile = require("../models/tile");
// const Color = require("../models/tileColor");
// const TileCategory = require("../models/tileCategory");

// // Cloudinary helper
// const { deleteFromCloudinary } = require("../utils/fileHelper");

// exports.createTile = async (req, res) => {
//   try {
//     const {
//       tileName,
//       category,
//       backgroundColor,
//       groutShape,
//       shapeStyle,
//       scale,
//     } = req.body;

//     // Validate required fields
//     if (!tileName) {
//       return res.status(400).json({ error: "Tile name is required" });
//     }

//     // Validate category
//     const tileCategory = await TileCategory.findById(category);
//     if (!tileCategory) {
//       return res.status(400).json({ 
//         error: "Invalid category selected",
//         details: "The selected category does not exist in the database"
//       });
//     }

//     // Validate background color
//     const bgColor = await Color.findById(backgroundColor);
//     if (!bgColor) {
//       return res.status(400).json({ 
//         error: "Invalid background color selected",
//         details: "The selected background color does not exist in the database"
//       });
//     }

//     // Validate main mask
//     if (!req.files?.mainMask?.[0]) {
//       return res.status(400).json({ 
//         error: "Main mask image is required",
//         details: "Please upload a main mask image"
//       });
//     }

//     const mainMaskUrl = req.files.mainMask[0].path;
//     const mainMaskPublicId = req.files.mainMask[0].filename;

//     // Sub mask handling
//     const tileMasks = req.files.tileMasks || [];
//     const tileMaskColors = Array.isArray(req.body.tileMaskColors)
//       ? req.body.tileMaskColors
//       : req.body.tileMaskColors
//       ? [req.body.tileMaskColors]
//       : [];

//     // Validate matching number of masks and colors
//     if (tileMasks.length !== tileMaskColors.length) {
//       // Clean up the uploaded main mask
//       await deleteFromCloudinary(mainMaskPublicId);
      
//       return res.status(400).json({
//         error: "Mismatched masks and colors",
//         details: `Number of tile masks (${tileMasks.length}) does not match number of colors (${tileMaskColors.length})`
//       });
//     }

//     // Validate sub mask color IDs
//     for (const colorId of tileMaskColors) {
//       const exists = await Color.findById(colorId);
//       if (!exists) {
//         // Clean up the uploaded main mask
//         await deleteFromCloudinary(mainMaskPublicId);
        
//         return res.status(400).json({
//           error: "Invalid sub mask color selected",
//           details: `Color ID ${colorId} does not exist in the database`
//         });
//       }
//     }

//     // Construct sub mask array
//     const subMasks = tileMasks.map((mask, index) => ({
//       image: mask.path,
//       publicId: mask.filename,
//       backgroundColor: tileMaskColors[index]
//     }));

//     const tile = new Tile({
//       tileName,
//       category,
//       mainMask: mainMaskUrl,
//       mainMaskPublicId,
//       backgroundColor,
//       groutShape,
//       shapeStyle,
//       scale: parseFloat(scale),
//       subMasks,
//     });

//     await tile.save();

//     const savedTile = await Tile.findById(tile._id)
//       .populate("backgroundColor", "hexCode")
//       .populate("category", "name")
//       .populate("subMasks.backgroundColor", "hexCode");

//     res.status(201).json(savedTile);
//   } catch (error) {
//     console.error("Create tile error:", error);
    
//     // Clean up any uploaded images if tile creation fails
//     if (req.files?.mainMask?.[0]) {
//       await deleteFromCloudinary(req.files.mainMask[0].filename);
//     }
//     if (req.files?.tileMasks) {
//       for (const mask of req.files.tileMasks) {
//         await deleteFromCloudinary(mask.filename);
//       }
//     }

//     // Send detailed error message
//     res.status(500).json({ 
//       error: "Failed to create tile",
//       details: error.message || "An unexpected error occurred while creating the tile"
//     });
//   }
// };

// exports.getTiles = async (req, res) => {
//   try {
//     const tiles = await Tile.find()
//       .populate("backgroundColor", "hexCode")
//       .populate("category", "name")
//       .populate("subMasks.backgroundColor", "hexCode")
//       .sort("-createdAt");

//     res.json(tiles);
//   } catch (error) {
//     console.error("Get tiles error:", error);
//     res.status(500).json({ error: "Failed to fetch tiles" });
//   }
// };

// exports.getTileById = async (req, res) => {
//   try {
//     const tile = await Tile.findById(req.params.id)
//       .populate("backgroundColor", "hexCode")
//       .populate("subMasks.backgroundColor", "hexCode")
//       .select("-mainMask -subMasks.image");

//     if (!tile) {
//       return res.status(404).json({ error: "Tile not found" });
//     }

//     res.json(tile);
//   } catch (error) {
//     console.error("Get tile error:", error);
//     res.status(500).json({ error: "Failed to fetch tile" });
//   }
// };

// exports.updateTile = async (req, res) => {
//   try {
//     const {
//       tileName,
//       category,
//       backgroundColor,
//       groutShape,
//       shapeStyle,
//       scale,
//     } = req.body;

//     // Find the existing tile
//     const tile = await Tile.findById(req.params.id);
//     if (!tile) {
//       return res.status(404).json({ error: "Tile not found" });
//     }

//     // Create update object with existing data
//     const updateData = {
//       tileName: tileName || tile.tileName,
//       category: category || tile.category,
//       backgroundColor: backgroundColor || tile.backgroundColor,
//       groutShape: groutShape || tile.groutShape,
//       shapeStyle: shapeStyle || tile.shapeStyle,
//       scale: scale !== undefined ? parseFloat(scale) : tile.scale,
//       mainMask: tile.mainMask,
//       mainMaskPublicId: tile.mainMaskPublicId,
//       subMasks: tile.subMasks
//     };

//     // Validate category if provided
//     if (category) {
//       const tileCategory = await TileCategory.findById(category);
//       if (!tileCategory) {
//         return res.status(400).json({
//           error: "Invalid category selected",
//           details: "The selected category does not exist in the database"
//         });
//       }
//     }

//     // Validate color if provided
//     if (backgroundColor) {
//       const color = await Color.findById(backgroundColor);
//       if (!color) {
//         return res.status(400).json({
//           error: "Invalid background color selected",
//           details: "The selected background color does not exist in the database"
//         });
//       }
//     }

//     // Handle main mask update if new file is uploaded
//     if (req.files?.mainMask?.[0]) {
//       // Delete old main mask from Cloudinary
//       if (tile.mainMaskPublicId) {
//         await deleteFromCloudinary(tile.mainMaskPublicId);
//       }
//       updateData.mainMask = req.files.mainMask[0].path;
//       updateData.mainMaskPublicId = req.files.mainMask[0].filename;
//     }

//     // Handle submasks update if new files or colors are provided
//     if (req.files?.tileMasks || req.body.tileMaskColors) {
//       const tileMasks = req.files?.tileMasks || [];
//       const tileMaskColors = Array.isArray(req.body.tileMaskColors)
//         ? req.body.tileMaskColors
//         : req.body.tileMaskColors
//         ? [req.body.tileMaskColors]
//         : [];

//       // If new masks are uploaded
//       if (tileMasks.length > 0) {
//         // Validate matching number of masks and colors
//         if (tileMasks.length !== tileMaskColors.length) {
//           // Clean up any newly uploaded files
//           for (const mask of tileMasks) {
//             await deleteFromCloudinary(mask.filename);
//           }
//           return res.status(400).json({
//             error: "Mismatched masks and colors",
//             details: `Number of tile masks (${tileMasks.length}) does not match number of colors (${tileMaskColors.length})`
//           });
//         }

//         // Validate color IDs
//         for (const colorId of tileMaskColors) {
//           const exists = await Color.findById(colorId);
//           if (!exists) {
//             // Clean up any newly uploaded files
//             for (const mask of tileMasks) {
//               await deleteFromCloudinary(mask.filename);
//             }
//             return res.status(400).json({
//               error: "Invalid sub mask color selected",
//               details: `Color ID ${colorId} does not exist in the database`
//             });
//           }
//         }

//         // Delete old submasks from Cloudinary
//         for (const mask of tile.subMasks) {
//           if (mask.publicId) {
//             await deleteFromCloudinary(mask.publicId);
//           }
//         }

//         // Create new submasks array
//         updateData.subMasks = tileMasks.map((mask, index) => ({
//           image: mask.path,
//           publicId: mask.filename,
//           backgroundColor: tileMaskColors[index]
//         }));
//       } else if (tileMaskColors.length > 0) {
//         // If only colors are being updated (no new files)
//         updateData.subMasks = tile.subMasks.map((mask, index) => ({
//           ...mask.toObject(),
//           backgroundColor: tileMaskColors[index] || mask.backgroundColor
//         }));
//       }
//     }

//     // Update the tile with all changes
//     const updatedTile = await Tile.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { 
//         new: true,
//         runValidators: true,
//         context: 'query'
//       }
//     ).populate("backgroundColor", "hexCode")
//      .populate("category", "name")
//      .populate("subMasks.backgroundColor", "hexCode");

//     if (!updatedTile) {
//       return res.status(404).json({ error: "Tile not found after update" });
//     }

//     res.json(updatedTile);
//   } catch (error) {
//     console.error("Update tile error:", error);
    
//     // Clean up any newly uploaded files if update fails
//     if (req.files?.mainMask?.[0]) {
//       await deleteFromCloudinary(req.files.mainMask[0].filename);
//     }
//     if (req.files?.tileMasks) {
//       for (const mask of req.files.tileMasks) {
//         await deleteFromCloudinary(mask.filename);
//       }
//     }

//     res.status(500).json({
//       error: "Failed to update tile",
//       details: error.message || "An unexpected error occurred while updating the tile"
//     });
//   }
// };

// exports.deleteTile = async (req, res) => {
//   try {
//     const tile = await Tile.findById(req.params.id);
//     if (!tile) {
//       return res.status(404).json({ error: "Tile not found" });
//     }
//     if (tile.mainMask) {
//       await deleteFromCloudinary(tile.mainMask);
//     }
//     for (const mask of tile.subMasks || []) {
//       if (mask.image) {
//         await deleteFromCloudinary(mask.image);
//       }
//     }

//     await tile.deleteOne();
//     res.json({ message: "Tile deleted successfully" });
//   } catch (error) {
//     console.error("Delete tile error:", error);
//     res.status(500).json({ error: "Failed to delete tile" });
//   }
// };

// // Get available grout shapes
// exports.getGroutShapes = async (req, res) => {
//   try {
//     const groutShapes = Tile.schema.path('groutShape').enumValues;
//     res.json(groutShapes);
//   } catch (error) {
//     console.error("Get grout shapes error:", error);
//     res.status(500).json({ error: "Failed to fetch grout shapes" });
//   }
// };

// // Get available shape styles
// exports.getShapeStyles = async (req, res) => {
//   try {
//     const shapeStyles = Tile.schema.path('shapeStyle').enumValues;
//     res.json(shapeStyles);
//   } catch (error) {
//     console.error("Get shape styles error:", error);
//     res.status(500).json({ error: "Failed to fetch shape styles" });
//   }
// };

// // Get scale range configuration
// exports.getScaleRange = async (req, res) => {
//   try {
//     const scalePath = Tile.schema.path('scale');
//     const scaleRange = {
//       min: scalePath.options.min,
//       max: scalePath.options.max,
//       step: 0.1 // We can keep this as a constant since it's not in the schema
//     };
//     res.json(scaleRange);
//   } catch (error) {
//     console.error("Get scale range error:", error);
//     res.status(500).json({ error: "Failed to fetch scale range" });
//   }
// };
const Tile = require("../models/tile");
const Color = require("../models/tileColor");
const TileCategory = require("../models/tileCategory");

// Cloudinary helper
const { deleteFromCloudinary, uploadToCloudinary } = require("../utils/fileHelper");

exports.createTile = async (req, res) => {
  try {
    const {
      tileName,
      category,
      backgroundColor,
      groutShape,
      shapeStyle,
      scale,
      tileMaskData
    } = req.body;

    // Validate required fields
    if (!tileName || !category || !backgroundColor || !groutShape || !shapeStyle || !scale) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate category exists
    const categoryExists = await TileCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Validate background color exists
    const colorExists = await Color.findById(backgroundColor);
    if (!colorExists) {
      return res.status(400).json({ message: 'Invalid background color' });
    }

    // Handle main mask upload
    if (!req.files || !req.files.mainMask) {
      return res.status(400).json({ message: 'Main mask image is required' });
    }

    const mainMaskResult = await uploadToCloudinary(req.files.mainMask[0].path);

    // Handle sub masks
    let subMasks = [];
    if (req.files.tileMasks && req.files.tileMasks.length > 0) {
      // Parse tileMaskData if it's a string
      const maskData = typeof tileMaskData === 'string' ? JSON.parse(tileMaskData) : tileMaskData;
      
      if (!Array.isArray(maskData) || maskData.length !== req.files.tileMasks.length) {
        // Clean up uploaded images if validation fails
        await deleteFromCloudinary(mainMaskResult.public_id);
        return res.status(400).json({ message: 'Invalid tile mask data' });
      }

      // Upload each sub mask and create sub mask objects
      for (let i = 0; i < req.files.tileMasks.length; i++) {
        const maskFile = req.files.tileMasks[i];
        const maskData = JSON.parse(tileMaskData)[i];
        
        // Validate background color exists
        const colorExists = await Color.findById(maskData.backgroundColor);
        if (!colorExists) {
          // Clean up uploaded images if validation fails
          await deleteFromCloudinary(mainMaskResult.public_id);
          for (const mask of subMasks) {
            await deleteFromCloudinary(mask.publicId);
          }
          return res.status(400).json({ message: `Invalid background color for mask ${i + 1}` });
        }

        const maskResult = await uploadToCloudinary(maskFile.path);
        subMasks.push({
          image: maskResult.secure_url,
          publicId: maskResult.public_id,
          backgroundColor: maskData.backgroundColor
        });
      }
    }

    // Create the tile
    const tile = new Tile({
      tileName,
      category,
      mainMask: {
        image: mainMaskResult.secure_url,
        publicId: mainMaskResult.public_id,
        backgroundColor
      },
      groutShape,
      shapeStyle,
      scale,
      subMasks
    });

    await tile.save();

    // Populate the response
    const populatedTile = await Tile.findById(tile._id)
      .populate('category')
      .populate('mainMask.backgroundColor', 'hexCode')
      .populate('subMasks.backgroundColor', 'hexCode');

    // Add colorsUsed field
    const mainColor = populatedTile.mainMask?.backgroundColor?.hexCode;
    const subColors = populatedTile.subMasks
      .map(mask => mask.backgroundColor?.hexCode)
      .filter(Boolean);
    const allColors = [...new Set([mainColor, ...subColors])];

    const result = {
      ...populatedTile.toObject(),
      colorsUsed: allColors
    };

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating tile:', error);
    res.status(500).json({ message: 'Error creating tile', error: error.message });
  }
};

exports.getAllTiles = async (req, res) => {
  try {
    const tiles = await Tile.find()
      .populate('category')
      .populate('mainMask.backgroundColor', 'hexCode')
      .populate('subMasks.backgroundColor', 'hexCode');

    const result = tiles.map(tile => {
      const mainColor = tile.mainMask?.backgroundColor?.hexCode;
      const subColors = tile.subMasks
        .map(mask => mask.backgroundColor?.hexCode)
        .filter(Boolean);
      const allColors = [...new Set([mainColor, ...subColors])];
      
      return {
        ...tile.toObject(),
        colorsUsed: allColors
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tiles', error: error.message });
  }
};

exports.getTileById = async (req, res) => {
  try {
    const tile = await Tile.findById(req.params.id)
      .populate('category')
      .populate('mainMask.backgroundColor', 'hexCode')
      .populate('subMasks.backgroundColor', 'hexCode');
    
    if (!tile) {
      return res.status(404).json({ message: 'Tile not found' });
    }

    const mainColor = tile.mainMask?.backgroundColor?.hexCode;
    const subColors = tile.subMasks
      .map(mask => mask.backgroundColor?.hexCode)
      .filter(Boolean);
    const allColors = [...new Set([mainColor, ...subColors])];

    const result = {
      ...tile.toObject(),
      colorsUsed: allColors
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tile', error: error.message });
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
      tileMaskData
    } = req.body;

    const tile = await Tile.findById(req.params.id);
    if (!tile) {
      return res.status(404).json({ message: 'Tile not found' });
    }

    // Handle main mask update if provided
    if (req.files && req.files.mainMask) {
      // Delete old main mask
      if (tile.mainMask?.publicId) {
        await deleteFromCloudinary(tile.mainMask.publicId);
      }
      
      const mainMaskResult = await uploadToCloudinary(req.files.mainMask[0].path);
      tile.mainMask = {
        image: mainMaskResult.secure_url,
        publicId: mainMaskResult.public_id,
        backgroundColor
      };
    }

    // Handle sub masks update if provided
    if (req.files && req.files.tileMasks && req.files.tileMasks.length > 0) {
      // Delete old sub masks
      for (const mask of tile.subMasks) {
        if (mask.publicId) {
          await deleteFromCloudinary(mask.publicId);
        }
      }

      // Parse tileMaskData if it's a string
      const maskData = typeof tileMaskData === 'string' ? JSON.parse(tileMaskData) : tileMaskData;
      
      if (!Array.isArray(maskData) || maskData.length !== req.files.tileMasks.length) {
        return res.status(400).json({ message: 'Invalid tile mask data' });
      }

      // Upload new sub masks
      const newSubMasks = [];
      for (let i = 0; i < req.files.tileMasks.length; i++) {
        const maskFile = req.files.tileMasks[i];
        const maskData = JSON.parse(tileMaskData)[i];
        
        // Validate background color exists
        const colorExists = await Color.findById(maskData.backgroundColor);
        if (!colorExists) {
          return res.status(400).json({ message: `Invalid background color for mask ${i + 1}` });
        }

        const maskResult = await uploadToCloudinary(maskFile.path);
        newSubMasks.push({
          image: maskResult.secure_url,
          publicId: maskResult.public_id,
          backgroundColor: maskData.backgroundColor
        });
      }
      tile.subMasks = newSubMasks;
    }

    // Update other fields
    if (tileName) tile.tileName = tileName;
    if (category) tile.category = category;
    if (backgroundColor) tile.mainMask.backgroundColor = backgroundColor;
    if (groutShape) tile.groutShape = groutShape;
    if (shapeStyle) tile.shapeStyle = shapeStyle;
    if (scale) tile.scale = scale;

    await tile.save();

    // Populate the response
    const updatedTile = await Tile.findById(tile._id)
      .populate('category')
      .populate('mainMask.backgroundColor', 'hexCode')
      .populate('subMasks.backgroundColor', 'hexCode');

    const mainColor = updatedTile.mainMask?.backgroundColor?.hexCode;
    const subColors = updatedTile.subMasks
      .map(mask => mask.backgroundColor?.hexCode)
      .filter(Boolean);
    const allColors = [...new Set([mainColor, ...subColors])];

    const result = {
      ...updatedTile.toObject(),
      colorsUsed: allColors
    };

    res.json(result);
  } catch (error) {
    console.error('Error updating tile:', error);
    res.status(500).json({ message: 'Error updating tile', error: error.message });
  }
};

exports.deleteTile = async (req, res) => {
  try {
    const tile = await Tile.findById(req.params.id);
    if (!tile) {
      return res.status(404).json({ message: 'Tile not found' });
    }

    await tile.deleteOne();
    res.json({ message: 'Tile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tile', error: error.message });
  }
};
