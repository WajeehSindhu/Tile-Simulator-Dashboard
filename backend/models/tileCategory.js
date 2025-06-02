const mongoose = require("mongoose");

const tileCategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true },
  description: { 
    type: String,
    trim: true },
});

module.exports = mongoose.model("TileCategory", tileCategorySchema);
