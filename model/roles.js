const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  permission: {
    type: Object,
    required: true,
  },
});

module.exports = mongoose.model("roles", roleSchema);