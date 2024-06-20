const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
  img: String,
  name: String,
  designation: String,
  experience: String,
  mail: String,
  phone: String,
  post: String,
});

module.exports = mongoose.model("faculty", facultySchema);
