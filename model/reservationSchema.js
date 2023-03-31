const mongoose = require("mongoose");

const reservationDocumentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "doctor",
    required: true,
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hospital",
    required: true,
  },
  date: { type: Date, required: true, default: Date.now() },
  slots: [
    {
      number: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      status: {
        type: String,
        default: "unreserved",
      },
      date : {
        type : Date
      }
    },
  ],
});

module.exports = new mongoose.model("reservations", reservationDocumentSchema);