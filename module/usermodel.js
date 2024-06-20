const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  passoutYear: Number,
  password: String,
});

module.exports = mongoose.model("user", userSchema);
