const mongoose = require("mongoose");

const tileSchema = new mongoose.Schema({
  name: String,
  description: String,
  mask: {
    backgroundColor: { type: String, required: true },
    groutShape: {
      type: String,
      enum: ["round", "square", "diamond"],
      required: true,
    },
    shapeStyle: {
      type: String,
      enum: [
        "modern",
        "classic",
        "retro",
        "minimal",
        "vintage",
        "abstract",
        "geometric",
        "organic",
      ],
      required: true,
    },
    scale: { type: Number, required: true },
    images: [{ type: String, required: true }],
  },
});

module.exports = mongoose.model("Tile", tileSchema);