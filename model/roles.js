const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  role_Id: {
    type:Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  permissions: {
    type: Object,
    required: true,
  },
});

module.exports = mongoose.model("roles", roleSchema);