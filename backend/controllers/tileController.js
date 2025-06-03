const Tile = require('../models/tile');
const Color = require('../models/tileColor');
const TileCategory = require('../models/tileCategory');
const { deleteFile } = require('../utils/fileHelper');
const path = require('path');

// Helper function to convert absolute path to relative path
const getRelativePath = (absolutePath) => {
  return absolutePath.split('uploads/')[1];
};

exports.createTile = async (req, res) => {
  try {
    const {
      tileName,
      category,
      backgroundColor,
      groutShape,
      shapeStyle,
      scale
    } = req.body;

    // Validate category exists
    const tileCategory = await TileCategory.findById(category);
    if (!tileCategory) {
      return res.status(400).json({ error: 'Invalid category selected' });
    }

    // Validate color exists
    const color = await Color.findById(backgroundColor);
    if (!color) {
      return res.status(400).json({ error: 'Invalid background color selected' });
    }

    // Validate files
    if (!req.files?.mainMask?.[0]) {
      return res.status(400).json({ error: 'Main mask image is required' });
    }

    const mainMaskPath = getRelativePath(req.files.mainMask[0].path.replace(/\\/g, '/')); // Convert Windows paths and make relative
    const tileMasks = req.files.tileMasks || [];
    const tileMaskColors = req.body.tileMaskColors ? 
      Array.isArray(req.body.tileMaskColors) ? 
        req.body.tileMaskColors : 
        [req.body.tileMaskColors] : 
      [];

    // Validate sub mask colors exist
    for (const colorId of tileMaskColors) {
      const exists = await Color.findById(colorId);
      if (!exists) {
        // Clean up uploaded files
        await deleteFile(path.join(__dirname, '..', 'uploads', mainMaskPath));
        for (const mask of tileMasks) {
          await deleteFile(mask.path);
        }
        return res.status(400).json({ error: `Invalid sub mask color selected: ${colorId}` });
      }
    }

    // Create sub masks array with normalized paths
    const subMasks = tileMasks.map((mask, index) => ({
      image: getRelativePath(mask.path.replace(/\\/g, '/')),
      backgroundColor: tileMaskColors[index]
    }));

    const tile = new Tile({
      tileName,
      category,
      mainMask: mainMaskPath,
      backgroundColor,
      groutShape,
      shapeStyle,
      scale: parseFloat(scale),
      subMasks
    });

    await tile.save();

    // Return complete tile data including file paths
    const savedTile = await Tile.findById(tile._id)
      .populate('backgroundColor', 'hexCode')
      .populate('category', 'name')
      .populate('subMasks.backgroundColor', 'hexCode');

    res.status(201).json(savedTile);
  } catch (error) {
    // Clean up any uploaded files if there's an error
    if (req.files?.mainMask?.[0]) {
      await deleteFile(req.files.mainMask[0].path);
    }
    if (req.files?.tileMasks) {
      for (const mask of req.files.tileMasks) {
        await deleteFile(mask.path);
      }
    }
    
    console.error('Create tile error:', error);
    res.status(500).json({ error: 'Failed to create tile' });
  }
};

exports.getTiles = async (req, res) => {
  try {
    const tiles = await Tile.find()
      .populate('backgroundColor', 'hexCode')
      .populate('category', 'name')
      .populate('subMasks.backgroundColor', 'hexCode')
      .sort('-createdAt');
    
    res.json(tiles);
  } catch (error) {
    console.error('Get tiles error:', error);
    res.status(500).json({ error: 'Failed to fetch tiles' });
  }
};

exports.getTileById = async (req, res) => {
  try {
    const tile = await Tile.findById(req.params.id)
      .populate('backgroundColor', 'hexCode')
      .populate('subMasks.backgroundColor', 'hexCode')
      .select('-mainMask -subMasks.image');
    
    if (!tile) {
      return res.status(404).json({ error: 'Tile not found' });
    }
    
    res.json(tile);
  } catch (error) {
    console.error('Get tile error:', error);
    res.status(500).json({ error: 'Failed to fetch tile' });
  }
};

exports.updateTile = async (req, res) => {
  try {
    const {
      tileName,
      backgroundColor,
      groutShape,
      shapeStyle,
      scale
    } = req.body;

    const tile = await Tile.findById(req.params.id);
    if (!tile) {
      return res.status(404).json({ error: 'Tile not found' });
    }

    // Validate color if being updated
    if (backgroundColor) {
      const color = await Color.findById(backgroundColor);
      if (!color) {
        return res.status(400).json({ error: 'Invalid background color selected' });
      }
    }

    // Handle main mask update
    let mainMaskPath = tile.mainMask;
    if (req.files?.mainMask?.[0]) {
      await deleteFile(path.join(__dirname, '..', 'uploads', mainMaskPath));
      mainMaskPath = getRelativePath(req.files.mainMask[0].path.replace(/\\/g, '/'));
    }

    // Handle sub masks update
    let subMasks = tile.subMasks;
    if (req.files?.tileMasks || req.body.tileMaskColors) {
      const tileMasks = req.files.tileMasks || [];
      const tileMaskColors = req.body.tileMaskColors ? 
        Array.isArray(req.body.tileMaskColors) ? 
          req.body.tileMaskColors : 
          [req.body.tileMaskColors] : 
        [];

      // Validate new sub mask colors
      for (const colorId of tileMaskColors) {
        const exists = await Color.findById(colorId);
        if (!exists) {
          return res.status(400).json({ error: `Invalid sub mask color selected: ${colorId}` });
        }
      }

      // Delete old sub mask images
      for (const mask of tile.subMasks) {
        await deleteFile(path.join(__dirname, '..', 'uploads', mask.image));
      }

      // Create new sub masks array
      subMasks = tileMasks.map((mask, index) => ({
        image: getRelativePath(mask.path.replace(/\\/g, '/')),
        backgroundColor: tileMaskColors[index]
      }));
    }

    tile.tileName = tileName || tile.tileName;
    tile.backgroundColor = backgroundColor || tile.backgroundColor;
    tile.groutShape = groutShape || tile.groutShape;
    tile.shapeStyle = shapeStyle || tile.shapeStyle;
    tile.scale = scale ? parseFloat(scale) : tile.scale;
    tile.mainMask = mainMaskPath;
    tile.subMasks = subMasks;

    await tile.save();

    // Return tile data without file paths
    const tileData = tile.toObject();
    delete tileData.mainMask;
    tileData.subMasks = tileData.subMasks.map(mask => ({
      ...mask,
      image: undefined
    }));

    res.json(tileData);
  } catch (error) {
    console.error('Update tile error:', error);
    res.status(500).json({ error: 'Failed to update tile' });
  }
};

exports.deleteTile = async (req, res) => {
  try {
    const tile = await Tile.findById(req.params.id);
    if (!tile) {
      return res.status(404).json({ error: 'Tile not found' });
    }

    // Delete all associated images
    await deleteFile(path.join(__dirname, '..', 'uploads', tile.mainMask));
    for (const mask of tile.subMasks) {
      await deleteFile(path.join(__dirname, '..', 'uploads', mask.image));
    }

    await tile.deleteOne();
    res.json({ message: 'Tile deleted successfully' });
  } catch (error) {
    console.error('Delete tile error:', error);
    res.status(500).json({ error: 'Failed to delete tile' });
  }
};
