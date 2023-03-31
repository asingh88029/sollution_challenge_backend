const User = require("../model/userSchema");
const Doctor = require("../model/docterSchema");
const Hospital = require("../model/hospitalSchema");
const CustomError = require("../errors");
const fs = require("fs");
const { promisify } = require("util");
const { UnauthenticatedError } = require("../errors");
const { verifyJwtToken } = require("../utils/JwtTokens");
const unlinkAsync = promisify(fs.unlink);

class AuthController {
  checkRoles = async (req, res) => {
    try {
      // let { authorization } = req.headers;
      // if (!authorization) throw new UnauthenticatedError("User not logged In");

      // const tokenDetails = authorization.split(" ");
      // const tokenType = tokenDetails[0];
      // const token = tokenDetails[1];

      // const decodedData = await verifyJwtToken(token);

      // console.log(decodedData);

      let roles = [];
      // let id = decodedData.loginDetails._id || decodedData.loginDetails.id;

      let {mobileNumber} = req.body ; 
      let phoneNumber = mobileNumber
      console.log(`MObile:   ${mobileNumber}`);
      // const scope = decodedData.scope;
      const scope="user";
      let entity;
      switch (scope) {
        case "user":
          entity = await User.findOne({mobileNumber:mobileNumber});
          console.log(entity);
          if(entity){
            mobileNumber = entity.mobileNumber;
            roles.push("user");
          }
          let isHospital = await Hospital.findOne({
            phoneNumber: mobileNumber,
          });
          if (isHospital) {
            roles.push("hospital");
          }
          let isDoctor = await Doctor.findOne({
            mobileNumber: mobileNumber,
          });
          if (isDoctor) {
            roles.push("doctor");
          }
          break;
        case "hospital":
          entity = await Hospital.findById(id);
          phoneNumber = entity.phoneNumber;
          roles.push("hospital");
          let isUser = await Hospital.findOne({
            mobileNumber: phoneNumber,
          });
          if (isUser) {
            roles.push("user");
          }
          isDoctor = await Doctor.findOne({
            mobileNumber: phoneNumber,
          });
          if (isDoctor) {
            roles.push("doctor");
          }
          break;
        case "doctor":
          entity = await Doctor.findById(id);
          mobileNumber = entity.mobileNumber;
          roles.push("doctor");
          isHospital = await Hospital.findOne({
            phoneeNumber: mobileNumber,
          });
          if (isHospital) {
            roles.push("hospital");
          }
          isUser = await User.findOne({
            mobileNumber: mobileNumber,
          });
          if (isUser) {
            roles.push("user");
          }
          break;
        default:
          break;
      }

      console.log(roles);
      res.status(200).send({ success: true, roles });
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };
}

module.exports = AuthController;
