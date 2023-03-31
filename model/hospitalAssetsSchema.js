const mongoose = require("mongoose");

const hospitalAssetsSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hospitals",
    required: true,
  },
  numberOfDoctors: {
    type: Number,
    required: true,
  },
  numberOfPatients: {
    type: Number,
    required: true,
  },
  numberOfActivePatients: {
    type: Number,
    required: true,
  },
  totalBeds: {
    type: Number,
    required: true,
  },
  occupiedBeds: {
    type: Number,
    required: true,
  },
  website: {
    type: String,
  },
});
const hospitalAssets = mongoose.model("hospitalAssets", hospitalAssetsSchema);
module.exports = hospitalAssets;

// Update Hospital Other Details
// Add Hospital Other Details