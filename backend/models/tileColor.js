const mongoose = require("mongoose");
const colorSchema = new mongoose.Schema({
  hexCode: {
    type: String,
    required: true,
    unique: true
  },
  noBackground: {
    type: Boolean,
    default: false
  }
});
module.exports = mongoose.model("Color", colorSchema);