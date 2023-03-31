const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const hospitalSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: true,
  },
  hospitalType: {
    type: [],
    required: true,
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  images: {
    type: [],
  },
  openingTime: {
    type: String,
  },
  closingTime: {
    type: String,
  },
  contactInfo: {
    address: {
      addressLine1: String,
      street: String,
      city: String,
      pinCode: Number,
      state: String,
      country: String,
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hospitalCoordinates",
  },
  assets: { type: mongoose.Schema.Types.ObjectId, ref: "hospitalAssets" },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "hospitalReviews" }],
  phoneOtp: {
    type: String,
  },
  tags: [],
  departments: [],
  specialities: [],
  diseases: [],
  sector: {
    type : String
  }
});

hospitalSchema.pre("save", async function () {
  // Checking whether password was modified or not
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

hospitalSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

hospitalSchema.methods.getLoginDetails = function () {
  let loginDetails = {};
  loginDetails._id = this._id;
  loginDetails.email = this.email;
  loginDetails.hospitalName = this.hospitalName;
  loginDetails.isVerified = this.isVerified;
  loginDetails.images = this.images;

  return loginDetails;
};

const hospital = mongoose.model("hospitals", hospitalSchema);
module.exports = hospital;

// Register a Hospital // concept -> email sent to verify hospital
// Login as Admin of Hospital
