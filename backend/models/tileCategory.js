const mongoose = require("mongoose");

const tileCategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true },
  description: { 
    type: String,
    trim: true },
  isBorderCategory: {
    type: Boolean,
    default: false
  },
  mainBorderMask: {
    type: String // Path to stored main border mask image file
  },
  mainBorderMaskPublicId: {
    type: String // Cloudinary public ID for main border mask
  },
  borderMasks: [
    {
      image: { type: String }, // Path to stored border mask image file
      publicId: { type: String }, // Cloudinary public ID
      color: { type: mongoose.Schema.Types.ObjectId, ref: 'Color' }
    }
  ]
});

module.exports = mongoose.model("TileCategory", tileCategorySchema);
