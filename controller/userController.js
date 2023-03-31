const User = require("../model/userSchema");
const CustomError = require("../errors");
const { generateOTP, sendMsg } = require("../utils/otp.util");
const { createJwtToken } = require("../utils/JwtTokens");
const cloudinary = require("../utils/cloudinary");
const Document = require("../model/documentSchema");
const fs = require("fs");
const { promisify } = require("util");
const DocumentSchema = require("../model/documentSchema");

const unlinkAsync = promisify(fs.unlink);

class UserController {
  // register Hospital
  register = async (req, res) => {
    try {
      const { name, mobileNumber } = req.body;
      if (!name || !mobileNumber)
        throw new CustomError.BadRequestError("name or mobile number missing");
      const user = {
        name,
        mobileNumber,
      };
      let registeredUser = await User.create(user);

      const otp = generateOTP(6);
      console.log(otp);
      // save otp to user collection
      registeredUser.phoneOtp = otp;
      await registeredUser.save();
      // send otp to phone number
      await sendMsg({
        otp: `${otp}`,
        contactNumber: registeredUser.mobileNumber,
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
      const user = await User.findOne({ mobileNumber, phoneOtp });
      if (!user) {
        throw new CustomError.BadRequestError("Something went wrong");
      }
      user.phoneOtp = "";
      await user.save();

      let loginDetails = user.getLoginDetails();
      let token = await createJwtToken({ loginDetails, scope: "user" });
      let bearerToken = {
        type: "Bearer",
        token,
        scope: "user",
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
      const user = await User.findOne({ mobileNumber });
      if (!user) {
        throw new CustomError.UnauthenticatedError(
          "This mobile number is not associated with any account"
        );
      }
      const otp = generateOTP(6);
      // save otp to user collection
      user.phoneOtp = otp;
      user.isAccountVerified = true;
      await user.save();
      // send otp to phone number
      await sendMsg({
        otp: `${otp}`,
        contactNumber: user.mobileNumber,
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

  showMe = async (req, res, next) => {
    try {
      let id = req.id || req._id
      let user = await User.findById(id);
      res.json(user);
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };

  getUser = async (req, res, next) => {
    try {
      let id = req.body.id
      let user = await User.findById(id);
      res.json(user);
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };

  updateUserDetails = async (req, res, next) => {
    try {
      let { name, email, mobileNumber, gender, dateOfBirth, aadhar, address } =
        req.body;

      let userData = {};
      userData.name = name || null;
      userData.email = email || null;
      userData.mobileNumber = mobileNumber || null;
      userData.gender = gender || null;
      var st = dateOfBirth || null;
      if (!st) {
        userData.dateOfBirth = null;
      } else {
        let pattern = /(\d{2})\/(\d{2})\/(\d{4})/;
        let dt = new Date(st.replace(pattern, "$3-$2-$1"));
        userData.dateOfBirth = dt;
      }

      userData.aadhar = aadhar || null;
      userData.address = address || null;

      for (const key in userData) {
        if (userData[key] === null) {
          delete userData[key];
        }
      }

      let userId = req.id;
      let user = await User.findByIdAndUpdate(userId, userData, { new: true });
      res.json(user);
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };

  changeProfilePic = async (req, res) => {
    try {
      const id = req.id;
      const user = await User.findById(id);
      if (!user) {
        throw new CustomError.UnauthorizedError(
          "Unauthorized to access this resource"
        );
      }
      let avatar = user.avatar;
      if (avatar && avatar.public_id) {
        const deleted = await cloudinary.uploader.destroy(avatar.public_id);
      }
      const result = await cloudinary.uploader.upload(req.file.path);
      if (!result) {
        throw new CustomError.BadRequestError(
          "Unable to Upload The Image At The Moment"
        );
      }
      user["avatar"] = {};
      user["avatar"].public_id = result.public_id;
      user["avatar"].secure_url = result.secure_url;

      console.log(user);
      await user.save();
      res.status(202).send(user);
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };

  addDocument = async (req, res) => {
    try {
      const id = req.id;
      const user = await User.findById(id);
      if (!user) {
        throw new CustomError.UnauthorizedError(
          "Unauthorized to access this resource"
        );
      }
      var img = fs.readFileSync(req.file.path);
      var encode_img = img.toString("base64");
      var final_doc = {
        userId: user._id,
        category: req.body.category,
        doc: {
          data: new Buffer(encode_img, "base64"),
          contentType: req.file.mimetype,
        },
      };
      Document.create(final_doc, async function (err, result) {
        if (err) {
          await unlinkAsync(req.file.path);
          console.log(err);
          res.status(400).send({
            success: false,
            message: "Some Error Occured while uploading the documents",
          });
        } else {
          await unlinkAsync(req.file.path);
          res.status(201).send({
            success: true,
            message: "Document Upload Successful",
          });
          // res.contentType(result.doc.contentType);
          // res.send(result.doc.data)
        }
      });
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };

  getMyDocuments = async (req, res) => {
    const id = req.id;
    let docs = await DocumentSchema.find({ userId: id }).select("-doc");
    console.log(docs);
    res.status(200).send({ success: true, docs });
  };

  downloadDocument = async (req, res) => {
    try {
      const id = req.id;
      const user = await User.findById(id);
      if (!user) {
        throw new CustomError.UnauthorizedError(
          "Unauthorized to access this resource"
        );
      }
      const { documentId } = req.params;

      Document.findById(documentId, async function (err, result) {
        if (err) {
          console.log(err);
          res.status(404).send({
            success: false,
            message: "Document Does Not Exist",
          });
        } else {
          res.contentType(result.doc.contentType);
          res.send(result.doc.data);
        }
      });
    } catch (error) {
      console.log(error.message);
      res
        .status(error.statusCode || 400)
        .send({ success: false, message: error.message });
    }
  };

  // login = async (req, res) => {
  //   try {
  //     const { email, password } = req.body;
  //     if (!email || !password) {
  //       throw new CustomError.BadRequestError(
  //         "Please provide email and password"
  //       );
  //     }
  //     const user = await User.findOne({ email }).select("+password");

  //     if (!user) {
  //       throw new CustomError.UnauthenticatedError("Invalid Credentials");
  //     }

  //     const isPasswordCorrect = await user.comparePassword(password);

  //     if (!isPasswordCorrect) {
  //       throw new CustomError.UnauthenticatedError("Invalid Credentials");
  //     }

  //     let loginDetails = user.getLoginDetails();
  //     let token = await createJwtToken(loginDetails);
  //     let bearerToken = {
  //       type: "Bearer",
  //       token,
  //     };

  //     // let rs = await Hospital.find({})
  //     res.status(200).send({ success: true, data: bearerToken });
  //   } catch (error) {
  //     console.log(error.message);
  //     res
  //       .status(error.statusCode || 400)
  //       .send({ success: false, message: error.message });
  //   }
  // };
}

module.exports = UserController;
