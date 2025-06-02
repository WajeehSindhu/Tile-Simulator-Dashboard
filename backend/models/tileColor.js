const mongoose = require("mongoose");
const colorSchema = new mongoose.Schema({
  name: String,
  hexCode: String,
});
module.exports = mongoose.model("Color", colorSchema);