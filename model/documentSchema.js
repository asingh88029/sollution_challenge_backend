const mongoose = require("mongoose");

const userDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hospitalAssets",
    required: true,
  },
  category: {
    type : String
  },
  doc: {
    data: Buffer,
    contentType: String,
  },
});

module.exports = new mongoose.model("userDocuments", userDocumentSchema);
