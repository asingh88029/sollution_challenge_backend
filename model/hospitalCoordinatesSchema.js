const mongoose = require("mongoose");
const hospitalSchema = require("./hospitalSchema")

const hospitalCoordinatesSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hospitals",
    required: true,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
});

const hospitalCoordinates = mongoose.model(
  "hospitalCoordinates",
  hospitalCoordinatesSchema
);
module.exports = hospitalCoordinates;

// Add Hospital Geographic Coordinates
// To Find Hospital Coordinates
// Separate Coordinate entry for each hospitals
// Verify Coordinate