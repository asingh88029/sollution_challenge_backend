const Doctor = require("../model/docterSchema");
const { generateOTP, sendMsg } = require("../utils/otp.util");
const { createJwtToken } = require("../utils/JwtTokens");
const CustomError = require("../errors");
const Hospital = require("../model/hospitalSchema");
const DoctorToHospital = require("../model/doctorToHospitalSchema");

const authenticateDoctor = require("../middleware/authenticateDoctor")


class DoctorController {
  constructor() {}

  // Hospital Admin can add a doctor
  addDoctor = async (req, res) => {
    try {
      let hospitalId = req.hospital._id || req.hospital.id ;
      const hospital = await Hospital.findById(hospitalId);
      if (!hospital)
        throw new CustomError.UnauthenticatedError("Session Expired");
      let { name, mobileNumber, department } = req.body;
      if (!name || !mobileNumber || !department) {
        throw new CustomError.BadRequestError("Bad request");
      }
      let association = {};
      association.hospital = hospital._id;
      association.department = department;

      let doctor = await Doctor.create({
        name,
        mobileNumber,
        association,
      });

      let doctoHos = await DoctorToHospital.create({
        hospital: hospital._id,
        doctor: doctor._id,
        department: department,
      });
      res
        .status(201)
        .send({ success: true, data: { hospital, doctor, doctoHos } });
    } catch (error) {
      res
        .status(error.status || 400)
        .json({ success: false, message: error.message });
    }
  };
  // Doctor Login
  loginWithPhone = async (req, res) => {
    try {
      const { mobileNumber } = req.body;
      if (!mobileNumber) {
        throw new CustomError.BadRequestError("Please provide mobile number");
      }
      const doctor = await Doctor.findOne({ mobileNumber });
      if (!doctor) {
        throw new CustomError.UnauthenticatedError(
          "Account does not exist ! Check again"
        );
      }
      const otp = generateOTP(6);
      console.log(otp);
      // save otp to user collection
      doctor.phoneOtp = otp;
      await doctor.save();
      // send otp to phone number
      await sendMsg({
        otp: `${otp}`,
        contactNumber: doctor.mobileNumber,
      });
      res.status(200).send({
        success: true,
        message: `A 6 digit otp is sent on ${mobileNumber}`,
      });

    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };

  verifyOTP = async (req, res) => {
    try {
      const { mobileNumber, phoneOtp } = req.body;
      if (!mobileNumber) {
        throw new CustomError.BadRequestError("Please provide mobile number");
      }
      if (phoneOtp.length != 6) {
        throw new CustomError.BadRequestError("Please provide mobile number");
      }
      const doctor = await Doctor.findOne({ mobileNumber, phoneOtp });
      if (!doctor) {
        throw new CustomError.BadRequestError("Something went wrong");
      }
      doctor.phoneOtp = "";

      let loginDetails = doctor.getLoginDetails();
      let token = await createJwtToken({loginDetails , scope: "doctor"});
      let bearerToken = {
        type: "Bearer",
        token,
        scope: "doctor",
      };
      res.status(200).send({ success: true, data: bearerToken });

      await doctor.save();
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };

  showMe = async(req,res) => {
    try {
      const id = req.doctor._id || req.doctor.id;
      console.log(id);

      Doctor.findById(id)
        .exec(function (err, doctor) {
          if (err) throw err;
          res.status(200).send(doctor);
        });
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  }

  // showMyBookings = async()
}

module.exports = DoctorController;
