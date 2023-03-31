const mongoose = require("mongoose");

const Department = require("../data/departmentList");
const Speciality = require("../data/specialityList");

const doctorSchema = new mongoose.Schema({
  association: {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospital",
    },
    department: {
      type: String,
      enum: Department,
    },
  },
  speciality: {
    type: String,
    enum: Speciality,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  mobileNumber: {
    type: String,
    unique: true,
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
    maxLength: 12,
    minLength: 12,
  },
  avatar: {
    public_id: String,
    secure_url: String,
  },
  address: {
    addressLine1: String,
    street: String,
    city: String,
    pinCode: Number,
    state: String,
    country: String,
  },
  phoneOtp: String,
  chargePerBooking: {
    type: Number,
  },
});

doctorSchema.methods.getLoginDetails = function () {
  let loginDetails = {};
  loginDetails._id = this._id;
  loginDetails.email = this.email;
  loginDetails.name = this.name;
  return loginDetails;
};

const doctor = mongoose.model("doctor", doctorSchema);
module.exports = doctor;
