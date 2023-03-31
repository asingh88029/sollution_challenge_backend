const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
  },
  phoneOtp: String,
});

const admin = mongoose.model("admins", adminSchema);
module.exports = admin;
