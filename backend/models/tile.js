const mongoose = require('mongoose');

const subMaskSchema = new mongoose.Schema({
  image: {
    type: String,  // Path to stored image file
    required: true
  },
  publicId: {
    type: String,  // Cloudinary public ID
    required: true
  },
  backgroundColor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color',
    required: true
  }
});

const tileSchema = new mongoose.Schema({
  tileName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TileCategory',
    required: true
  },
  mainMask: {
    type: String,  // Path to stored image file
    required: true
  },
  mainMaskPublicId: {
    type: String,  // Cloudinary public ID
    required: true
  },
  backgroundColor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color',
    required: true
  },
  groutShape: {
    type: String,
    enum: ['Square', 'No Grout', 'H2 Lines'],
    required: true
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
    ],
    required: true
  },
  scale: {
    type: Number,
    required: true,
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