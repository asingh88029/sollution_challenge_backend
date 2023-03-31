const Admin = require("../model/adminSchema");
const CustomError = require("../errors");
const { generateOTP, sendMsg } = require("../utils/otp.util");
const { createJwtToken } = require("../utils/JwtTokens");
const fs = require("fs");
const { promisify } = require("util");

const unlinkAsync = promisify(fs.unlink);

const Hospital = require("../model/hospitalSchema");

class AdminController {
  verifyOTP = async (req, res) => {
    try {
      const { mobileNumber, phoneOtp } = req.body;
      if (!mobileNumber) {
        throw new CustomError.BadRequestError("Please provide mobile number");
      }
      if (phoneOtp.length != 6) {
        throw new CustomError.BadRequestError("Please provide mobile number");
      }
      const admin = await Admin.findOne({ mobileNumber, phoneOtp });
      if (!admin) {
        throw new CustomError.BadRequestError("Something went wrong");
      }
      admin.phoneOtp = "";
      await admin.save();

      let token = await createJwtToken({ admin, scope: "aadmin" });
      let bearerToken = {
        type: "Bearer",
        token,
        scope: "admin",
      };
      res.status(200).send({ success: true, data: bearerToken });
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };

  login = async (req, res) => {
    try {
      const { mobileNumber } = req.body;
      if (!mobileNumber) {
        throw new CustomError.BadRequestError("Please provide mobile number ");
      }
      const admin = await Admin.findOne({ mobileNumber });
      if (!admin) {
        throw new CustomError.UnauthenticatedError(
          "This mobile number is not associated with any account"
        );
      }
      const otp = generateOTP(6);
      // save otp to user collection
      admin.phoneOtp = otp;
      await admin.save();
      // send otp to phone number
      await sendMsg({
        otp: `${otp}`,
        contactNumber: admin.mobileNumber,
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
  verifyHospitals = async (req, res) => {
    try {
      let { hospitalId } = req.body;

      let hospital = await Hospital.findByIdAndUpdate(hospitalId, {
        isVerified: true,
      });

      res
        .status(200)
        .send({ success: true, message: "successFully verified hospital" });
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };
}

module.exports = AdminController;
