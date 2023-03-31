const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    // required: true,
    // unique: true,
  },
  mobileNumber: {
    type: String,
  },
  password: {
    type: String,
    // required: true,
    select: false,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  dateOfBirth: {
    type: Date,
  },
  aadhar: {
    type: String,
    unique: true,
    maxLength: 12,
    minLength: 12,
  },
  avatar: {
    public_id : String,
    secure_url : String
  },
  address: {
    addressLine1: String,
    street: String,
    city: String,
    pinCode: Number,
    state: String,
    country: String,
  },
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "userDocuments" }],
  phoneOtp : String
});

userSchema.pre("save", async function () {
  // Checking whether password was modified or not
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

userSchema.methods.getLoginDetails = function () {
  let loginDetails = {};
  loginDetails._id = this._id;
  loginDetails.email = this.email;
  loginDetails.name = this.name;

  return loginDetails;
};

const user = mongoose.model("users", userSchema);
module.exports = user;
