const mongoose = require("mongoose");

const PlacementDataSchema = new mongoose.Schema({
  StdName: String,
  ComName: String,
  packgae: Number,
  year: Number,
});

module.exports = mongoose.model("PlacementData", PlacementDataSchema);
