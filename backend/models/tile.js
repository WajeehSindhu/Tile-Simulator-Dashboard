const mongoose = require('mongoose');

const subMaskSchema = new mongoose.Schema({
  image: {
    type: String,  // Path to stored image file
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
  mainMask: {
    type: String,  // Path to stored image file
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

module.exports = mongoose.model('Tile', tileSchema); 