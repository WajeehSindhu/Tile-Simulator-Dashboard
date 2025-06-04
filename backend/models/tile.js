const mongoose = require('mongoose');

const subMaskSchema = new mongoose.Schema({
  image: {
    type: String  // Path to stored image file
  },
  publicId: {
    type: String  // Cloudinary public ID
  },
  backgroundColor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color'
  }
});

const tileSchema = new mongoose.Schema({
  tileName: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TileCategory'
  },
  mainMask: {
    type: String  // Path to stored image file
  },
  mainMaskPublicId: {
    type: String  // Cloudinary public ID
  },
  backgroundColor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color'
  },
  groutShape: {
    type: String,
    enum: ['Square', 'No Grout', 'H2 Lines']
  },
  shapeStyle: {
    type: String,
    enum: [
      'Square',
      'Hexagon',
      'Lola',
      'Rectangle 2x8',
      'Triangle',
      'Rectangle 4x8',
      'Arabesquare'
    ]
  },
  scale: {
    type: Number,
    min: 0.1,
    max: 10
  },
  subMasks: [subMaskSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add middleware to clean up Cloudinary images before deletion
tileSchema.pre('deleteOne', { document: true }, async function(next) {
  try {
    const { deleteFromCloudinary } = require('../utils/fileHelper');
    
    // Delete main mask
    if (this.mainMaskPublicId) {
      await deleteFromCloudinary(this.mainMaskPublicId);
    }
    
    // Delete sub masks
    for (const mask of this.subMasks || []) {
      if (mask.publicId) {
        await deleteFromCloudinary(mask.publicId);
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Tile', tileSchema); 