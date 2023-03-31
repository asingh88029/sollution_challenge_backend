const mongoose = require("mongoose");

const hospitalSchema = require("./hospitalSchema");

const hospitalReviewSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospitals",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    comment: {
      type: String,
    },
    rating: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

hospitalReviewSchema.index({ hospitalId: 1, userId: 1 }, { unique: true });

hospitalReviewSchema.pre("deleteOne", {document: true }, async function (next) {
  if (this.hospitalId) {
    let hospital = await hospitalSchema.findById(this.hospitalId);
    hospital.reviews.remove(this._id);
    await hospital.save();
  }

  next()
});

const hospitalReviews = mongoose.model("hospitalReviews", hospitalReviewSchema);
module.exports = hospitalReviews;

// Add review
// Update Review
// Show Reviews
// Delete Reviews
