const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  passoutYear: Number,
  image: { type: Buffer },
  imageType: String,
  password: String,
});

module.exports = mongoose.model("user", userSchema);
